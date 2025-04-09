package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
)

type AppConfigHandler struct {
	repo repository.ConfigRepository
}

func NewAppConfigHandler(repo repository.ConfigRepository) *AppConfigHandler {
	return &AppConfigHandler{repo: repo}
}

// ListConfigs handles GET /api/config
func (h *AppConfigHandler) ListConfigs(c *gin.Context) {
	configs, err := h.repo.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, configs)
}

// GetConfig handles GET /api/config/:key
func (h *AppConfigHandler) GetConfig(c *gin.Context) {
	key := c.Param("key")
	config, err := h.repo.Get(c.Request.Context(), key)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if config == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Configuration not found"})
		return
	}
	c.JSON(http.StatusOK, config)
}

// UpdateConfig handles PUT /api/config/:key
func (h *AppConfigHandler) UpdateConfig(c *gin.Context) {
	key := c.Param("key")
	var input struct {
		Value string `json:"value" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.Update(c.Request.Context(), key, input.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// UpdateSyncInterval handles PUT /api/config/sync_interval
func (h *AppConfigHandler) UpdateSyncInterval(c *gin.Context) {
	var input struct {
		Interval int `json:"interval" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate interval
	validIntervals := []int{5, 15, 30, 60}
	isValid := false
	for _, valid := range validIntervals {
		if input.Interval == valid {
			isValid = true
			break
		}
	}
	if !isValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sync interval: must be 5, 15, 30, or 60 minutes"})
		return
	}

	// Update config in database
	err := h.repo.Update(c.Request.Context(), "sync_interval", strconv.Itoa(input.Interval))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}
