package gorm

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
	"github.com/ofkm/svelocker-ui/backend/internal/services"
	"github.com/ofkm/svelocker-ui/backend/internal/utils"
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
		Preload("Metadata").
		First(&tag)

	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	// Store various digests we might use for deletion
	var possibleDigests []string

	// Add the tag's primary digest
	if tag.Digest != "" {
		possibleDigests = append(possibleDigests, tag.Digest)
	}

	// Add metadata digests if available
	if tag.Metadata.IndexDigest != "" {
		possibleDigests = append(possibleDigests, tag.Metadata.IndexDigest)
	}
	if tag.Metadata.ContentDigest != "" {
		possibleDigests = append(possibleDigests, tag.Metadata.ContentDigest)
	}

	// Delete metadata and tag from database first
	if err := tx.Where("tag_id = ?", tag.ID).Delete(&models.TagMetadata{}).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Delete(&tag).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Commit().Error; err != nil {
		return err
	}

	sanitizedTagName := strings.ReplaceAll(tagName, "\n", "")
	sanitizedTagName = strings.ReplaceAll(sanitizedTagName, "\r", "")
	log.Printf("Successfully deleted tag %s from database", sanitizedTagName)

	// Registry path setup
	baseURL := os.Getenv("PUBLIC_REGISTRY_URL")
	username := os.Getenv("REGISTRY_USERNAME")
	password := os.Getenv("REGISTRY_PASSWORD")
	client := services.NewRegistryClient(baseURL, username, password)

	registryPath := imageName
	if repoName != "library" {
		registryPath = fmt.Sprintf("%s/%s", repoName, imageName)
	}

	// First try to get the current manifest to extract its digest
	// This is the most reliable approach for getting the correct digest
	currentManifestDigest := getManifestDigestForTag(ctx, baseURL, username, password, registryPath, tagName)
	if currentManifestDigest != "" {
		possibleDigests = append([]string{currentManifestDigest}, possibleDigests...)
	}

	// Try deleting using each digest until one succeeds
	var lastErr error
	for _, digest := range possibleDigests {
		log.Printf("Attempting to delete manifest using digest: %s", digest)

		if err := client.DeleteManifest(ctx, registryPath, digest); err == nil {
			log.Printf("Successfully deleted manifest with digest: %s", digest)
			return nil
		} else {
			log.Printf("Failed to delete manifest with digest %s: %v", digest, err)
			lastErr = err
		}
	}

	if lastErr != nil {
		log.Printf("Warning: All deletion attempts failed. Database updated but registry cleanup failed: %v", lastErr)
	}

	return nil // Database was updated successfully even if registry deletion failed
}

// Helper function to get manifest digest for a tag
func getManifestDigestForTag(ctx context.Context, baseURL, username, password, repository, tag string) string {
	url := fmt.Sprintf("%s/v2/%s/manifests/%s", baseURL, repository, tag)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		log.Printf("Failed to create request: %v", err)
		return ""
	}

	// Accept all manifest types to be thorough
	req.Header.Add("Accept",
		"application/vnd.docker.distribution.manifest.v2+json,"+
			"application/vnd.oci.image.manifest.v1+json,"+
			"application/vnd.docker.distribution.manifest.list.v2+json,"+
			"application/vnd.oci.image.index.v1+json")

	if username != "" && password != "" {
		req.SetBasicAuth(username, password)
	}

	client := &http.Client{Timeout: time.Minute}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to get manifest: %v", err)
		return ""
	}
	defer resp.Body.Close()

	// Extract body content from response for digest calculation
	bodyBytes, _ := io.ReadAll(resp.Body)
	bodyContent := string(bodyBytes)

	// Get the proper digest for deletion - check header first, then calculate if needed
	digestToDelete := utils.GetCorrectDeleteDigest(
		resp.Header.Get("Docker-Content-Digest"),
		bodyContent,
	)

	log.Printf("Using digest for deletion: %s", digestToDelete)

	return digestToDelete
}
