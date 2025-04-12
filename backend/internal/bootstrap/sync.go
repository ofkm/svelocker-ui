package bootstrap

import (
	"context"

	"github.com/ofkm/svelocker-ui/backend/internal/services"
)

func (app *Application) initSyncService(ctx context.Context) error {
	// Create sync service instance
	app.SyncSvc = services.NewSyncService(
		app.DockerRepo,
		app.ImageRepo,
		app.TagRepo,
		app.ConfigRepo,
		app.Config.Registry.URL,
		app.Config.Registry.Username,
		app.Config.Registry.Password,
	)

	// Start the sync service
	if err := app.SyncSvc.Start(ctx); err != nil {
		return err
	}

	return nil
}
