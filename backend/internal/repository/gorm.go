package repository

import (
	"context"
	"errors"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
	"gorm.io/gorm"
)

type GormStore struct {
	db *gorm.DB
}

func NewGormStore(db *gorm.DB) *GormStore {
	return &GormStore{db: db}
}

// Repository operations
func (s *GormStore) ListRepositories(ctx context.Context, page, limit int, search string) ([]models.Repository, int64, error) {
	var repositories []models.Repository
	var total int64

	query := s.db.Model(&models.Repository{})
	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).
		Preload("Images", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, repository_id, name, full_name, pull_count")
		}).
		Find(&repositories).Error

	return repositories, total, err
}

func (s *GormStore) GetRepository(ctx context.Context, name string) (*models.Repository, error) {
	var repository models.Repository
	err := s.db.Where("name = ?", name).
		Preload("Images.Tags.Metadata.Layers").
		First(&repository).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &repository, nil
}

func (s *GormStore) CreateRepository(ctx context.Context, repo *models.Repository) error {
	return s.db.Create(repo).Error
}

func (s *GormStore) UpdateRepository(ctx context.Context, repo *models.Repository) error {
	return s.db.Save(repo).Error
}

func (s *GormStore) DeleteRepository(ctx context.Context, name string) error {
	return s.db.Where("name = ?", name).Delete(&models.Repository{}).Error
}

// Image operations
func (s *GormStore) ListImages(ctx context.Context, repoName string) ([]models.Image, error) {
	var images []models.Image
	err := s.db.Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ?", repoName).
		Preload("Tags.Metadata.Layers").
		Find(&images).Error
	return images, err
}

func (s *GormStore) GetImage(ctx context.Context, repoName, imageName string) (*models.Image, error) {
	var image models.Image
	err := s.db.Joins("JOIN repositories ON repositories.id = images.repository_id").
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

func (s *GormStore) CreateImage(ctx context.Context, image *models.Image) error {
	return s.db.Create(image).Error
}

func (s *GormStore) UpdateImage(ctx context.Context, image *models.Image) error {
	return s.db.Save(image).Error
}

func (s *GormStore) DeleteImage(ctx context.Context, repoName, imageName string) error {
	return s.db.Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ? AND images.name = ?", repoName, imageName).
		Delete(&models.Image{}).Error
}

// Tag operations
func (s *GormStore) ListTags(ctx context.Context, repoName, imageName string) ([]models.Tag, error) {
	var tags []models.Tag
	err := s.db.Joins("JOIN images ON images.id = tags.image_id").
		Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ? AND images.name = ?", repoName, imageName).
		Preload("Metadata.Layers").
		Find(&tags).Error
	return tags, err
}

func (s *GormStore) GetTag(ctx context.Context, repoName, imageName, tagName string) (*models.Tag, error) {
	var tag models.Tag
	err := s.db.Joins("JOIN images ON images.id = tags.image_id").
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

func (s *GormStore) CreateTag(ctx context.Context, tag *models.Tag) error {
	return s.db.Create(tag).Error
}

func (s *GormStore) UpdateTag(ctx context.Context, tag *models.Tag) error {
	return s.db.Save(tag).Error
}

func (s *GormStore) DeleteTag(ctx context.Context, repoName, imageName, tagName string) error {
	return s.db.Joins("JOIN images ON images.id = tags.image_id").
		Joins("JOIN repositories ON repositories.id = images.repository_id").
		Where("repositories.name = ? AND images.name = ? AND tags.name = ?", repoName, imageName, tagName).
		Delete(&models.Tag{}).Error
}
