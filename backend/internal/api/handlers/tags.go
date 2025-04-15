package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
)

type TagHandler struct {
	repo repository.TagRepository
}

func NewTagHandler(repo repository.TagRepository) *TagHandler {
	return &TagHandler{repo: repo}
}

// ListTags handles GET /api/repositories/:name/images/:image/tags
func (h *TagHandler) ListTags(c *gin.Context) {
	repoName := c.Param("name")
	imageName := c.Param("image")

	tags, err := h.repo.ListTags(c.Request.Context(), repoName, imageName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tags)
}

// GetTag handles GET /api/repositories/:name/images/:image/tags/:tag
func (h *TagHandler) GetTag(c *gin.Context) {
	repoName := c.Param("name")
	imageName := c.Param("image")
	tagName := c.Param("tag")

	tag, err := h.repo.GetTag(c.Request.Context(), repoName, imageName, tagName)
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

// DeleteTag handles requests to delete a specific tag
func (h *TagHandler) DeleteTag(c *gin.Context) {
	repoName := c.Param("name")
	imageName := c.Param("image")
	tagName := c.Param("tag")

	// Call repository method to delete the tag
	err := h.repo.DeleteTag(c, repoName, imageName, tagName)
	if err != nil {
		status := http.StatusInternalServerError
		if strings.Contains(err.Error(), "record not found") {
			status = http.StatusNotFound
		}

		c.JSON(status, gin.H{
			"error": fmt.Sprintf("Failed to delete tag: %v", err),
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Tag %s deleted successfully", tagName),
	})
}
