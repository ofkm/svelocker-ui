package models

import "gorm.io/gorm"

// AppConfig represents application configuration stored in the database
type AppConfig struct {
	gorm.Model
	Key   string `json:"key" gorm:"uniqueIndex"`
	Value string `json:"value"`
}
