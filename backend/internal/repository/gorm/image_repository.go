package gorm

import (
	"context"
	"errors"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
	"gorm.io/gorm"
)

type imageRepository struct {
	db *gorm.DB
}

func NewImageRepository(db *gorm.DB) repository.ImageRepository {
	return &imageRepository{db: db}
}

func (r *imageRepository) ListImages(ctx context.Context, repoName string) ([]models.Image, error) {
	var images []models.Image
	err := r.db.Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ?", repoName).
		Preload("Tags.Metadata.Layers").
		Find(&images).Error
	return images, err
}

func (r *imageRepository) GetImage(ctx context.Context, repoName, imageName string) (*models.Image, error) {
	var image models.Image
	err := r.db.Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ? AND images.name = ?", repoName, imageName).
		Preload("Tags.Metadata.Layers").
		First(&image).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &image, nil
}

func (r *imageRepository) CreateImage(ctx context.Context, image *models.Image) error {
	return r.db.Create(image).Error
}

func (r *imageRepository) UpdateImage(ctx context.Context, image *models.Image) error {
	return r.db.Save(image).Error
}

func (r *imageRepository) DeleteImage(ctx context.Context, repoName, imageName string) error {
	return r.db.Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ? AND images.name = ?", repoName, imageName).
		Delete(&models.Image{}).Error
}
