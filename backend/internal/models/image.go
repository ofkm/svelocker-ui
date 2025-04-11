package models

import "gorm.io/gorm"

// Image represents a Docker image in a repository
type Image struct {
	gorm.Model
	RepositoryID uint   `json:"repositoryId"`
	Name         string `json:"name"`
	FullName     string `json:"fullName"`
	PullCount    int    `json:"pullCount"`
	Tags         []Tag  `json:"tags,omitempty" gorm:"foreignKey:ImageID"`
}

// ImageLayer represents a layer in a Docker image
type ImageLayer struct {
	gorm.Model
	TagMetadataID uint   `json:"tagMetadataId"`
	Size          int64  `json:"size"`
	Digest        string `json:"digest"`
}
