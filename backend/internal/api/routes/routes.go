package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/api/handlers"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
)

func SetupRoutes(r *gin.Engine, store repository.RepositoryStore) {
	// Create handlers
	repoHandler := handlers.NewRepositoryHandler(store)
	imageHandler := handlers.NewImageHandler(store)
	tagHandler := handlers.NewTagHandler(store)
	configHandler := handlers.NewAppConfigHandler(store)

	// API v1 group
	v1 := r.Group("/api/v1")
	{
		// App Config routes
		config := v1.Group("/config")
		{
			config.GET("", configHandler.ListConfigs)
			config.GET("/:key", configHandler.GetConfig)
			config.PUT("/:key", configHandler.UpdateConfig)
		}

		// Repository routes
		repos := v1.Group("/repositories")
		{
			repos.GET("", repoHandler.ListRepositories)
			repos.GET("/:name", repoHandler.GetRepository)

			// Image routes
			repos.GET("/:name/images", imageHandler.ListImages)
			repos.GET("/:name/images/:image", imageHandler.GetImage)

			// Tag routes
			repos.GET("/:name/images/:image/tags", tagHandler.ListTags)
			repos.GET("/:name/images/:image/tags/:tag", tagHandler.GetTag)
		}
	}
}
