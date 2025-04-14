package gorm

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
	"github.com/ofkm/svelocker-ui/backend/internal/services"
	"gorm.io/gorm"
)

type tagRepository struct {
	db *gorm.DB
}

func NewTagRepository(db *gorm.DB) repository.TagRepository {
	return &tagRepository{db: db}
}

func (r *tagRepository) ListTags(ctx context.Context, repoName, imageName string) ([]models.Tag, error) {
	var tags []models.Tag
	err := r.db.Joins("JOIN images ON images.id = tags.image_id").
		Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ? AND images.name = ?", repoName, imageName).
		Find(&tags).Error
	return tags, err
}

func (r *tagRepository) GetTag(ctx context.Context, repoName, imageName, tagName string) (*models.Tag, error) {
	var tag models.Tag
	err := r.db.Joins("JOIN images ON images.id = tags.image_id").
		Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ? AND images.name = ? AND tags.name = ?", repoName, imageName, tagName).
		Preload("Metadata.Layers").
		First(&tag).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepository) CreateTag(ctx context.Context, tag *models.Tag) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Create the tag first
		if err := tx.Create(tag).Error; err != nil {
			return fmt.Errorf("failed to create tag: %w", err)
		}

		// Set the TagID for the metadata and ensure ID is not set
		tag.Metadata.TagID = tag.ID
		tag.Metadata.ID = 0 // Reset ID to ensure auto-increment

		// Create the metadata
		if err := tx.Create(&tag.Metadata).Error; err != nil {
			return fmt.Errorf("failed to create tag metadata: %w", err)
		}

		// Create the layers if they exist
		if len(tag.Metadata.Layers) > 0 {
			for i := range tag.Metadata.Layers {
				tag.Metadata.Layers[i].TagMetadataID = tag.Metadata.ID
				tag.Metadata.Layers[i].ID = 0 // Reset ID to ensure auto-increment
			}
			if err := tx.Create(&tag.Metadata.Layers).Error; err != nil {
				return fmt.Errorf("failed to create layers: %w", err)
			}
		}

		return nil
	})
}

func (r *tagRepository) UpdateTag(ctx context.Context, tag *models.Tag) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Update the tag itself
		if err := tx.Save(tag).Error; err != nil {
			return fmt.Errorf("failed to save tag: %w", err)
		}

		// Update or create metadata
		if tag.Metadata.ID != 0 {
			if err := tx.Save(&tag.Metadata).Error; err != nil {
				return fmt.Errorf("failed to update metadata: %w", err)
			}
		} else {
			tag.Metadata.TagID = tag.ID
			if err := tx.Create(&tag.Metadata).Error; err != nil {
				return fmt.Errorf("failed to create metadata: %w", err)
			}
		}

		// Handle layers
		if len(tag.Metadata.Layers) > 0 {
			// Delete existing layers
			if err := tx.Where("tag_metadata_id = ?", tag.Metadata.ID).Delete(&models.ImageLayer{}).Error; err != nil {
				return fmt.Errorf("failed to delete existing layers: %w", err)
			}

			// Reset layer IDs and set metadata ID
			for i := range tag.Metadata.Layers {
				tag.Metadata.Layers[i].ID = 0 // Reset ID to ensure auto-increment
				tag.Metadata.Layers[i].TagMetadataID = tag.Metadata.ID
			}

			// Create new layers
			if err := tx.Create(&tag.Metadata.Layers).Error; err != nil {
				return fmt.Errorf("failed to create new layers: %w", err)
			}
		}

		return nil
	})
}

func (r *tagRepository) DeleteTag(ctx context.Context, repoName, imageName, tagName string) error {
	// Start a transaction
	tx := r.db.Begin()

	// Find the tag to delete
	var tag models.Tag

	// Find the tag using the correct JOIN structure
	result := tx.Joins("JOIN images ON images.id = tags.image_id").
		Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ? AND images.name = ? AND tags.name = ?", repoName, imageName, tagName).
		Preload("Metadata"). // Preload metadata to get the proper deletion digest
		First(&tag)

	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	// Store the digest for registry deletion later
	// First try to use ContentDigest, then IndexDigest, then fall back to Digest as last resort
	var digestToDelete string
	if tag.Metadata.ContentDigest != "" {
		digestToDelete = tag.Metadata.ContentDigest
	} else if tag.Metadata.IndexDigest != "" {
		digestToDelete = tag.Metadata.IndexDigest
	} else {
		digestToDelete = tag.Digest
	}

	// Delete any metadata related to this tag
	if err := tx.Where("tag_id = ?", tag.ID).Delete(&models.TagMetadata{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete the tag itself
	if err := tx.Delete(&tag).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return err
	}

	// If we have a digest, also delete the manifest from the registry
	if digestToDelete != "" {
		// Get registry client from environment config
		baseURL := os.Getenv("PUBLIC_REGISTRY_URL")
		username := os.Getenv("REGISTRY_USERNAME")
		password := os.Getenv("REGISTRY_PASSWORD")

		client := services.NewRegistryClient(baseURL, username, password)

		// Format repository path for registry API
		registryPath := imageName
		if repoName != "library" {
			registryPath = fmt.Sprintf("%s/%s", repoName, imageName)
		}

		// Add debug logging
		fmt.Printf("Attempting to delete manifest with digest: %s for path: %s\n", digestToDelete, registryPath)

		// Delete manifest from registry
		if err := client.DeleteManifest(ctx, registryPath, digestToDelete); err != nil {
			// Log error but continue - we've already deleted from DB
			fmt.Printf("Error deleting manifest: %v\n", err)

			// Try again with a different digest if available
			if tag.Metadata.IndexDigest != "" && tag.Metadata.IndexDigest != digestToDelete {
				fmt.Printf("Retry with IndexDigest: %s\n", tag.Metadata.IndexDigest)
				if err := client.DeleteManifest(ctx, registryPath, tag.Metadata.IndexDigest); err != nil {
					return fmt.Errorf("database updated but failed to delete manifest from registry: %w", err)
				}
			} else {
				return fmt.Errorf("database updated but failed to delete manifest from registry: %w", err)
			}
		}
	}

	return nil
}
