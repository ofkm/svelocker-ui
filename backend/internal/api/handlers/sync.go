package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/services"
)

type SyncHandler struct {
	syncSvc *services.SyncService
}

func NewSyncHandler(syncSvc *services.SyncService) *SyncHandler {
	return &SyncHandler{syncSvc: syncSvc}
}

// TriggerSync handles POST /api/sync
func (h *SyncHandler) TriggerSync(c *gin.Context) {
	if err := h.syncSvc.PerformSync(c.Request.Context()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

// GetLastSync handles GET /api/sync/last
func (h *SyncHandler) GetLastSync(c *gin.Context) {
	lastSync, err := h.syncSvc.GetLastSyncTime(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if lastSync == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No sync has been performed yet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"lastSync": lastSync})
}
