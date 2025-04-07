package bootstrap

import (
	"context"

	"github.com/ofkm/svelocker-ui/backend/internal/repository/gorm"
)

func (app *Application) initRepositories() error {
	// Initialize repositories
	app.ConfigRepo = gorm.NewConfigRepository(app.DB)
	app.DockerRepo = gorm.NewDockerRepository(app.DB)
	app.ImageRepo = gorm.NewImageRepository(app.DB)
	app.TagRepo = gorm.NewTagRepository(app.DB)

	// Initialize default configuration in database
	ctx := context.Background()
	if err := app.ConfigRepo.Update(ctx, "registry_url", app.Config.Registry.URL); err != nil {
		return err
	}
	if err := app.ConfigRepo.Update(ctx, "registry_name", app.Config.Registry.Name); err != nil {
		return err
	}

	return nil
}
