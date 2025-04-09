package bootstrap

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/api/routes"
)

func (app *Application) initRouter() error {
	// Set Gin mode based on log level
	if app.Config.Logging.Level == "DEBUG" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	r := gin.Default()

	// Set up CORS middleware
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		// Allow specific origins
		if origin == getEnv("PUBLIC_APP_URL", "http://localhost") {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}

		// Allow credentials to be sent with the request
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Set up routes with the repositories and sync service
	routes.SetupRoutes(r, app.ConfigRepo, app.DockerRepo, app.ImageRepo, app.TagRepo, app.SyncSvc)

	app.Router = r
	return nil
}

// Helper function to get environment variable with default value
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
