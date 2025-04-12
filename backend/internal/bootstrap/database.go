package bootstrap

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
)

// Current DB schema version
const DB_VERSION = "0.27.0" // This should follow the version if breaking chnages are added to the schema

func (app *Application) initDatabase() error {
	dbPath := app.Config.Database.Path

	// Check if the database file exists
	if _, err := os.Stat(dbPath); err == nil {
		// Try to connect to the database to check compatibility
		tempConfig := app.Config.Database
		tempDB, err := tempConfig.Connect(app.Config.Logging.Level)

		// If we can connect, check if the schema is compatible
		if err == nil {
			// Check for the version table/record
			var configRecord models.AppConfig
			result := tempDB.Where("key = ?", "db_version").First(&configRecord)

			// If we couldn't find the version record or it doesn't match our current version,
			// the database is incompatible
			if result.Error != nil || configRecord.Value != DB_VERSION {
				// Create backup path with timestamp
				timestamp := time.Now().Format("20060102_150405")
				backupPath := fmt.Sprintf("%s.bak.%s", dbPath, timestamp)

				// Close tempDB connection before renaming
				sqlDB, _ := tempDB.DB()
				if sqlDB != nil {
					sqlDB.Close()
				}

				// Rename the database file
				if err := os.Rename(dbPath, backupPath); err != nil {
					return fmt.Errorf("failed to rename incompatible database: %w", err)
				}
			} else {
				// Database is compatible, use it
				app.DB = tempDB
				return nil
			}
		} else {
			// If we couldn't connect, assume it's incompatible
			timestamp := time.Now().Format("20060102_150405")
			backupPath := fmt.Sprintf("%s.bak.%s", dbPath, timestamp)

			// Rename the database file
			if err := os.Rename(dbPath, backupPath); err != nil {
				return fmt.Errorf("failed to rename incompatible database: %w", err)
			}
		}
	}

	// At this point, either:
	// 1. The database didn't exist
	// 2. The database was incompatible and renamed
	// 3. We couldn't connect to the database and renamed it
	// So we need to create a new one

	// Create the directory if it doesn't exist
	dbDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return fmt.Errorf("failed to create database directory: %w", err)
	}

	// Initialize a new database connection
	db, err := app.Config.Database.Connect(app.Config.Logging.Level)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
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
		return fmt.Errorf("failed to auto-migrate database: %w", err)
	}

	// Set the database version in the new database
	versionRecord := models.AppConfig{Key: "db_version", Value: DB_VERSION}
	if result := db.Where("key = ?", "db_version").FirstOrCreate(&versionRecord); result.Error != nil {
		return fmt.Errorf("failed to set database version: %w", result.Error)
	}

	app.DB = db
	return nil
}
