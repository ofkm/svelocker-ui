package repository

import (
	"context"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
)

// ImageRepository handles database operations for Docker images
type ImageRepository interface {
	ListImages(ctx context.Context, repoName string) ([]models.Image, error)
	GetImage(ctx context.Context, repoName, imageName string) (*models.Image, error)
	CreateImage(ctx context.Context, image *models.Image) error
	UpdateImage(ctx context.Context, image *models.Image) error
	DeleteImage(ctx context.Context, repoName, imageName string) error
}
