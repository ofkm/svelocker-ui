package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
)

type AppConfigHandler struct {
	store repository.RepositoryStore
}

func NewAppConfigHandler(store repository.RepositoryStore) *AppConfigHandler {
	return &AppConfigHandler{store: store}
}

// ListConfigs handles GET /api/config
func (h *AppConfigHandler) ListConfigs(c *gin.Context) {
	configs, err := h.store.ListAppConfigs(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, configs)
}

// GetConfig handles GET /api/config/:key
func (h *AppConfigHandler) GetConfig(c *gin.Context) {
	key := c.Param("key")
	config, err := h.store.GetAppConfig(c.Request.Context(), key)
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

	err := h.store.UpdateAppConfig(c.Request.Context(), key, input.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}
