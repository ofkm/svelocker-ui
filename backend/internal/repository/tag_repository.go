package repository

import (
	"context"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
)

// TagRepository handles database operations for Docker image tags
type TagRepository interface {
	ListTags(ctx context.Context, repoName, imageName string) ([]models.Tag, error)
	GetTag(ctx context.Context, repoName, imageName, tagName string) (*models.Tag, error)
	CreateTag(ctx context.Context, tag *models.Tag) error
	UpdateTag(ctx context.Context, tag *models.Tag) error
	DeleteTag(ctx context.Context, repoName, imageName, tagName string) error
}
