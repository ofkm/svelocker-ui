package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
)

type RepositoryHandler struct {
	store repository.RepositoryStore
}

func NewRepositoryHandler(store repository.RepositoryStore) *RepositoryHandler {
	return &RepositoryHandler{store: store}
}

// ListRepositories handles GET /api/repositories
func (h *RepositoryHandler) ListRepositories(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.DefaultQuery("search", "")

	repositories, total, err := h.store.ListRepositories(c.Request.Context(), page, limit, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"repositories": repositories,
		"totalCount":   total,
		"page":         page,
		"limit":        limit,
	})
}

// GetRepository handles GET /api/repositories/:name
func (h *RepositoryHandler) GetRepository(c *gin.Context) {
	name := c.Param("name")
	repository, err := h.store.GetRepository(c.Request.Context(), name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if repository == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repository not found"})
		return
	}

	c.JSON(http.StatusOK, repository)
}

// ListImages handles GET /api/repositories/:name/images
func (h *RepositoryHandler) ListImages(c *gin.Context) {
	repoName := c.Param("name")
	images, err := h.store.ListImages(c.Request.Context(), repoName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, images)
}

// GetImage handles GET /api/repositories/:name/images/:image
func (h *RepositoryHandler) GetImage(c *gin.Context) {
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

// ListTags handles GET /api/repositories/:name/images/:image/tags
func (h *RepositoryHandler) ListTags(c *gin.Context) {
	repoName := c.Param("name")
	imageName := c.Param("image")

	tags, err := h.store.ListTags(c.Request.Context(), repoName, imageName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tags)
}

// GetTag handles GET /api/repositories/:name/images/:image/tags/:tag
func (h *RepositoryHandler) GetTag(c *gin.Context) {
	repoName := c.Param("name")
	imageName := c.Param("image")
	tagName := c.Param("tag")

	tag, err := h.store.GetTag(c.Request.Context(), repoName, imageName, tagName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if tag == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tag not found"})
		return
	}

	c.JSON(http.StatusOK, tag)
}
