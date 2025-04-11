package gorm

import (
	"context"
	"errors"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
	"gorm.io/gorm"
)

type configRepository struct {
	db *gorm.DB
}

func NewConfigRepository(db *gorm.DB) repository.ConfigRepository {
	return &configRepository{db: db}
}

func (r *configRepository) Get(ctx context.Context, key string) (*models.AppConfig, error) {
	var config models.AppConfig
	err := r.db.Where("key = ?", key).First(&config).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &config, nil
}

func (r *configRepository) Update(ctx context.Context, key, value string) error {
	result := r.db.Where("key = ?", key).
		Assign(models.AppConfig{Value: value}).
		FirstOrCreate(&models.AppConfig{Key: key, Value: value})
	return result.Error
}

func (r *configRepository) List(ctx context.Context) ([]models.AppConfig, error) {
	var configs []models.AppConfig
	err := r.db.Find(&configs).Error
	return configs, err
}
