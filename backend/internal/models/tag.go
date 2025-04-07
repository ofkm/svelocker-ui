package models

import (
	"time"

	"gorm.io/gorm"
)

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
