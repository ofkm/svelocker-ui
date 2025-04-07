package repository

import (
	"context"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
)

// RepositoryStore handles database operations for repositories
type RepositoryStore interface {
	// Repository operations
	ListRepositories(ctx context.Context, page, limit int, search string) ([]models.Repository, int64, error)
	GetRepository(ctx context.Context, name string) (*models.Repository, error)
	CreateRepository(ctx context.Context, repo *models.Repository) error
	UpdateRepository(ctx context.Context, repo *models.Repository) error
	DeleteRepository(ctx context.Context, name string) error

	// Image operations
	ListImages(ctx context.Context, repoName string) ([]models.Image, error)
	GetImage(ctx context.Context, repoName, imageName string) (*models.Image, error)
	CreateImage(ctx context.Context, image *models.Image) error
	UpdateImage(ctx context.Context, image *models.Image) error
	DeleteImage(ctx context.Context, repoName, imageName string) error

	// Tag operations
	ListTags(ctx context.Context, repoName, imageName string) ([]models.Tag, error)
	GetTag(ctx context.Context, repoName, imageName, tagName string) (*models.Tag, error)
	CreateTag(ctx context.Context, tag *models.Tag) error
	UpdateTag(ctx context.Context, tag *models.Tag) error
	DeleteTag(ctx context.Context, repoName, imageName, tagName string) error
}
