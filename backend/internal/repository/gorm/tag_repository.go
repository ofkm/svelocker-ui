package gorm

import (
	"context"
	"errors"

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
		Preload("Metadata.Layers").
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
	return r.db.Create(tag).Error
}

func (r *tagRepository) UpdateTag(ctx context.Context, tag *models.Tag) error {
	return r.db.Save(tag).Error
}

func (r *tagRepository) DeleteTag(ctx context.Context, repoName, imageName, tagName string) error {
	return r.db.Joins("JOIN images ON images.id = tags.image_id").
		Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ? AND images.name = ? AND tags.name = ?", repoName, imageName, tagName).
		Delete(&models.Tag{}).Error
}
