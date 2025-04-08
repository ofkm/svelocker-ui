package utils

import (
	"log"
	"strings"
)

// ExtractDockerfileFromHistory generates a Dockerfile-like content from image history
// Similar to the TypeScript version: config.history?.map((entry: any) => entry.created_by).join('\n')
func ExtractDockerfileFromHistory(history []struct {
	Created    string `json:"created"`
	CreatedBy  string `json:"created_by"`
	Author     string `json:"author"`
	Comment    string `json:"comment"`
	EmptyLayer bool   `json:"empty_layer"`
}) string {
	var dockerCommands []string

	if len(history) == 0 {
		return "No Dockerfile found"
	}

	for _, historyEntry := range history {
		if historyEntry.CreatedBy != "" {
			// Clean up the command
			cmd := strings.TrimPrefix(historyEntry.CreatedBy, "/bin/sh -c ")
			cmd = strings.TrimPrefix(cmd, "#(nop) ")
			cmd = strings.TrimSpace(cmd)

			if cmd != "" {
				dockerCommands = append(dockerCommands, cmd)
			}
		}
	}

	if len(dockerCommands) == 0 {
		return "No Dockerfile found"
	}

	return strings.Join(dockerCommands, "\n")
}

// ExtractAuthorFromLabels extracts the author from image labels, similar to TypeScript implementation
func ExtractAuthorFromLabels(labels map[string]string, defaultAuthor string) string {

	if labels == nil {
		return defaultAuthor
	}

	// Check all possible label variations
	labelKeys := []string{
		"org.opencontainers.image.authors",
		"org.opencontainers.image.vendor",
		"maintainer",
		"MAINTAINER",
		"Author",
		"author",
	}

	for _, key := range labelKeys {
		if value, exists := labels[key]; exists && value != "" {
			log.Printf("Found author in label %s: %s", key, value)
			return value
		}
	}

	// If no labels match and we have a default author, use it
	if defaultAuthor != "" {
		return defaultAuthor
	}

	return "Unknown"
}
