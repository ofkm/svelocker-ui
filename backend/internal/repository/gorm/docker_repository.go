package gorm

import (
	"context"
	"errors"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
	"gorm.io/gorm"
)

type dockerRepository struct {
	db *gorm.DB
}

func NewDockerRepository(db *gorm.DB) repository.DockerRepository {
	return &dockerRepository{db: db}
}

func (r *dockerRepository) ListRepositories(ctx context.Context, page, limit int, search string) ([]models.Repository, int64, error) {
	var repositories []models.Repository
	var total int64

	query := r.db.Model(&models.Repository{})
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

func (r *dockerRepository) GetRepository(ctx context.Context, name string) (*models.Repository, error) {
	var repository models.Repository
	err := r.db.Where("name = ?", name).
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

func (r *dockerRepository) CreateRepository(ctx context.Context, repo *models.Repository) error {
	return r.db.Create(repo).Error
}

func (r *dockerRepository) UpdateRepository(ctx context.Context, repo *models.Repository) error {
	return r.db.Save(repo).Error
}

func (r *dockerRepository) DeleteRepository(ctx context.Context, name string) error {
	return r.db.Where("name = ?", name).Delete(&models.Repository{}).Error
}
