package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
)

type RepositoryHandler struct {
	repo repository.DockerRepository
}

func NewRepositoryHandler(repo repository.DockerRepository) *RepositoryHandler {
	return &RepositoryHandler{repo: repo}
}

// ListRepositories handles GET /api/repositories
func (h *RepositoryHandler) ListRepositories(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.DefaultQuery("search", "")

	repositories, total, err := h.repo.ListRepositories(c.Request.Context(), page, limit, search)
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
	repository, err := h.repo.GetRepository(c.Request.Context(), name)
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
