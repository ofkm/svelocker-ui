package bootstrap

import (
	"path/filepath"

	"github.com/joho/godotenv"
	"github.com/ofkm/svelocker-ui/backend/internal/config"
)

func (app *Application) initConfig() error {
	// Load .env file if it exists
	if err := godotenv.Load(filepath.Join(".", ".env")); err != nil {
		// Try loading from backend directory
		if err := godotenv.Load(filepath.Join("backend", ".env")); err != nil {
			// Continue without .env file - using environment variables
		}
	}

	// Initialize application configuration
	appConfig, err := config.NewAppConfig()
	if err != nil {
		return err
	}

	// Validate configuration
	if err := appConfig.Validate(); err != nil {
		return err
	}

	app.Config = appConfig
	return nil
}
