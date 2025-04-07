package bootstrap

import "github.com/ofkm/svelocker-ui/backend/internal/models"

func (app *Application) initDatabase() error {
	// Initialize database connection
	db, err := app.Config.Database.Connect(app.Config.Logging.Level)
	if err != nil {
		return err
	}

	// Auto-migrate database schemas
	if err := db.AutoMigrate(
		&models.AppConfig{},
		&models.Repository{},
		&models.Image{},
		&models.Tag{},
		&models.TagMetadata{},
		&models.ImageLayer{},
	); err != nil {
		return err
	}

	app.DB = db
	return nil
}
