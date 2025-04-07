package repository

import (
	"context"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
)

// ConfigRepository handles database operations for application configuration
type ConfigRepository interface {
	Get(ctx context.Context, key string) (*models.AppConfig, error)
	Update(ctx context.Context, key, value string) error
	List(ctx context.Context) ([]models.AppConfig, error)
}
