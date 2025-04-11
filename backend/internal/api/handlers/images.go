package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
)

type ImageHandler struct {
	repo repository.ImageRepository
}

func NewImageHandler(repo repository.ImageRepository) *ImageHandler {
	return &ImageHandler{repo: repo}
}

// ListImages handles GET /api/repositories/:name/images
func (h *ImageHandler) ListImages(c *gin.Context) {
	repoName := c.Param("name")
	images, err := h.repo.ListImages(c.Request.Context(), repoName)
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

	image, err := h.repo.GetImage(c.Request.Context(), repoName, imageName)
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
