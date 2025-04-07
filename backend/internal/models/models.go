package models

import (
	"time"

	"gorm.io/gorm"
)

// AppConfig represents application configuration stored in the database
type AppConfig struct {
	gorm.Model
	Key   string `json:"key" gorm:"uniqueIndex"`
	Value string `json:"value"`
}

// Repository represents a Docker repository
type Repository struct {
	gorm.Model
	Name       string    `json:"name" gorm:"uniqueIndex"`
	LastSynced time.Time `json:"lastSynced"`
	Images     []Image   `json:"images,omitempty" gorm:"foreignKey:RepositoryID"`
}

// Image represents a Docker image in a repository
type Image struct {
	gorm.Model
	RepositoryID uint   `json:"repositoryId"`
	Name         string `json:"name"`
	FullName     string `json:"fullName"`
	PullCount    int    `json:"pullCount"`
	Tags         []Tag  `json:"tags,omitempty" gorm:"foreignKey:ImageID"`
}

// Tag represents an image tag
type Tag struct {
	gorm.Model
	ImageID   uint        `json:"imageId"`
	Name      string      `json:"name"`
	Digest    string      `json:"digest"`
	CreatedAt time.Time   `json:"createdAt"`
	Metadata  TagMetadata `json:"metadata,omitempty" gorm:"foreignKey:TagID"`
}

// TagMetadata represents metadata for a tag
type TagMetadata struct {
	gorm.Model
	TagID         uint         `json:"tagId"`
	Created       string       `json:"created"`
	OS            string       `json:"os"`
	Architecture  string       `json:"architecture"`
	Author        string       `json:"author"`
	DockerFile    string       `json:"dockerFile" gorm:"type:text"`
	ConfigDigest  string       `json:"configDigest"`
	ExposedPorts  string       `json:"exposedPorts" gorm:"type:text"` // JSON string array
	TotalSize     int64        `json:"totalSize"`
	WorkDir       string       `json:"workDir"`
	Command       string       `json:"command"`
	Description   string       `json:"description"`
	ContentDigest string       `json:"contentDigest"`
	Entrypoint    string       `json:"entrypoint"`
	IndexDigest   string       `json:"indexDigest"`
	IsOCI         bool         `json:"isOCI"`
	Layers        []ImageLayer `json:"layers,omitempty" gorm:"foreignKey:TagMetadataID"`
}

// ImageLayer represents a layer in a Docker image
type ImageLayer struct {
	gorm.Model
	TagMetadataID uint   `json:"tagMetadataId"`
	Size          int64  `json:"size"`
	Digest        string `json:"digest"`
}
