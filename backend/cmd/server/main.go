package main

import (
	"context"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/api/routes"
	"github.com/ofkm/svelocker-ui/backend/internal/config"
	"github.com/ofkm/svelocker-ui/backend/internal/models"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
)

func main() {
	// Initialize application configuration
	appConfig, err := config.NewAppConfig()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Validate configuration
	if err := appConfig.Validate(); err != nil {
		log.Fatal("Invalid configuration:", err)
	}

	// Initialize database connection
	db, err := appConfig.Database.Connect(appConfig.Logging.Level)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
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
		log.Fatal("Failed to migrate database:", err)
	}

	// Create repository store
	store := repository.NewGormStore(db)

	// Initialize default configuration in database
	if err := initializeDefaultConfig(store, appConfig); err != nil {
		log.Fatal("Failed to initialize default configuration:", err)
	}

	// Set Gin mode based on log level
	if appConfig.Logging.Level == "DEBUG" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	r := gin.Default()

	// Set up CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Set up routes
	routes.SetupRoutes(r, store)

	// Start server
	serverAddr := fmt.Sprintf("%s:%d", appConfig.Server.Host, appConfig.Server.Port)
	if err := r.Run(serverAddr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func initializeDefaultConfig(store repository.RepositoryStore, appConfig *config.AppConfig) error {
	ctx := context.Background()

	// Initialize registry configuration
	if err := store.UpdateAppConfig(ctx, "registry_url", appConfig.Registry.URL); err != nil {
		return err
	}
	if err := store.UpdateAppConfig(ctx, "registry_name", appConfig.Registry.Name); err != nil {
		return err
	}

	return nil
}
