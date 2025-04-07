package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
)

type ImageHandler struct {
	store repository.RepositoryStore
}

func NewImageHandler(store repository.RepositoryStore) *ImageHandler {
	return &ImageHandler{store: store}
}

// ListImages handles GET /api/repositories/:name/images
func (h *ImageHandler) ListImages(c *gin.Context) {
	repoName := c.Param("name")
	images, err := h.store.ListImages(c.Request.Context(), repoName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, images)
}

// GetImage handles GET /api/repositories/:name/images/:image
func (h *ImageHandler) GetImage(c *gin.Context) {
	repoName := c.Param("name")
	imageName := c.Param("image")

	image, err := h.store.GetImage(c.Request.Context(), repoName, imageName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if image == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	c.JSON(http.StatusOK, image)
}
