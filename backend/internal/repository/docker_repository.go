package repository

import (
	"context"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
)

// DockerRepository handles database operations for Docker repositories
type DockerRepository interface {
	// Repository operations
	ListRepositories(ctx context.Context, page, limit int, search string) ([]models.Repository, int64, error)
	GetRepository(ctx context.Context, name string) (*models.Repository, error)
	CreateRepository(ctx context.Context, repo *models.Repository) error
	UpdateRepository(ctx context.Context, repo *models.Repository) error
	DeleteRepository(ctx context.Context, name string) error
}
