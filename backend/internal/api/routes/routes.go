package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/api/handlers"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
)

func SetupRoutes(r *gin.Engine, store repository.RepositoryStore) {
	// Create handlers
	repoHandler := handlers.NewRepositoryHandler(store)

	// API v1 group
	v1 := r.Group("/api/v1")
	{
		// Repository routes
		repos := v1.Group("/repositories")
		{
			repos.GET("", repoHandler.ListRepositories)
			repos.GET("/:name", repoHandler.GetRepository)

			// Image routes
			repos.GET("/:name/images", repoHandler.ListImages)
			repos.GET("/:name/images/:image", repoHandler.GetImage)

			// Tag routes
			repos.GET("/:name/images/:image/tags", repoHandler.ListTags)
			repos.GET("/:name/images/:image/tags/:tag", repoHandler.GetTag)
		}
	}
}
