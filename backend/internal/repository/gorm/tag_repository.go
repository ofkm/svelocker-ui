package gorm

import (
	"context"
	"errors"
	"fmt"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
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
	return r.db.Joins("JOIN images ON images.id = tags.image_id").
		Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ? AND images.name = ? AND tags.name = ?", repoName, imageName, tagName).
		Delete(&models.Tag{}).Error
}
