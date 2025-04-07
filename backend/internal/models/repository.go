package models

import (
	"time"

	"gorm.io/gorm"
)

// Repository represents a Docker repository
type Repository struct {
	gorm.Model
	Name       string    `json:"name" gorm:"uniqueIndex"`
	LastSynced time.Time `json:"lastSynced"`
	Images     []Image   `json:"images,omitempty" gorm:"foreignKey:RepositoryID"`
}
