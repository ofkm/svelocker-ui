package bootstrap

import (
	"log"
	"path/filepath"

	"github.com/joho/godotenv"
	"github.com/ofkm/svelocker-ui/backend/internal/config"
)

func (app *Application) initConfig() error {
	// Load .env file if it exists
	if err := godotenv.Load(filepath.Join(".", ".env")); err != nil {
		// Try loading from backend directory
		if err := godotenv.Load(filepath.Join("backend", ".env")); err != nil {
			// Log the error or handle it as needed
			log.Println("No .env file found, using environment variables")
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
