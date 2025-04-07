// Package bootstrap handles application initialization and setup
package bootstrap

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/config"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
	"github.com/ofkm/svelocker-ui/backend/internal/services"
	"gorm.io/gorm"
)

// Application represents the bootstrapped application
type Application struct {
	Config     *config.AppConfig
	DB         *gorm.DB
	Router     *gin.Engine
	ConfigRepo repository.ConfigRepository
	DockerRepo repository.DockerRepository
	ImageRepo  repository.ImageRepository
	TagRepo    repository.TagRepository
	SyncSvc    *services.SyncService
}

// Bootstrap initializes the application
func Bootstrap(ctx context.Context) (*Application, error) {
	app := &Application{}

	// Initialize configuration
	if err := app.initConfig(); err != nil {
		return nil, err
	}

	// Initialize database
	if err := app.initDatabase(); err != nil {
		return nil, err
	}

	// Initialize repositories
	if err := app.initRepositories(); err != nil {
		return nil, err
	}

	// Initialize sync service
	if err := app.initSyncService(ctx); err != nil {
		return nil, err
	}

	// Initialize router and middleware
	if err := app.initRouter(); err != nil {
		return nil, err
	}

	return app, nil
}

func (app *Application) Close() error {
	if app.SyncSvc != nil {
		app.SyncSvc.Stop()
	}
	return nil
}
