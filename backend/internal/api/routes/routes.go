package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/api/handlers"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
	"github.com/ofkm/svelocker-ui/backend/internal/services"
)

func SetupRoutes(
	r *gin.Engine,
	configRepo repository.ConfigRepository,
	dockerRepo repository.DockerRepository,
	imageRepo repository.ImageRepository,
	tagRepo repository.TagRepository,
	syncSvc *services.SyncService,
) {
	// Create handlers with their specific repositories
	repoHandler := handlers.NewRepositoryHandler(dockerRepo)
	imageHandler := handlers.NewImageHandler(imageRepo)
	tagHandler := handlers.NewTagHandler(tagRepo)
	configHandler := handlers.NewAppConfigHandler(configRepo)
	syncHandler := handlers.NewSyncHandler(syncSvc)

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

		// Sync routes
		sync := v1.Group("/sync")
		{
			sync.POST("", syncHandler.TriggerSync)
			sync.GET("/last", syncHandler.GetLastSync)
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
			repos.DELETE("/:name/images/:image/tags/:tag", tagHandler.DeleteTag)
		}
	}
}
