package utils

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"
)

// OCI manifest structure
type OCIManifest struct {
	MediaType     string            `json:"mediaType,omitempty"`
	SchemaVersion int               `json:"schemaVersion,omitempty"`
	Config        *OCIDescriptor    `json:"config,omitempty"`
	Layers        []*OCIDescriptor  `json:"layers,omitempty"`
	Manifests     []*OCIManifest    `json:"manifests,omitempty"`
	Annotations   map[string]string `json:"annotations,omitempty"`
	Platform      *OCIPlatform      `json:"platform,omitempty"`
	Digest        string            `json:"digest,omitempty"`
}

type OCIDescriptor struct {
	MediaType   string            `json:"mediaType,omitempty"`
	Digest      string            `json:"digest,omitempty"`
	Size        int64             `json:"size,omitempty"`
	Annotations map[string]string `json:"annotations,omitempty"`
	Platform    *OCIPlatform      `json:"platform,omitempty"`
}

type OCIPlatform struct {
	Architecture string `json:"architecture,omitempty"`
	OS           string `json:"os,omitempty"`
	Variant      string `json:"variant,omitempty"`
}

// FilterAttestationManifests removes attestation manifests and ensures deterministic ordering
// Similar to TypeScript filterAttestationManifests function
func FilterAttestationManifests(manifestJson string) (string, error) {
	var manifest OCIManifest

	// Parse the manifest JSON
	if err := json.Unmarshal([]byte(manifestJson), &manifest); err != nil {
		log.Printf("Error parsing manifest JSON: %v", err)
		return manifestJson, err
	}

	// Filter out attestation manifests if present
	if manifest.Manifests != nil && len(manifest.Manifests) > 0 {
		var filteredManifests []*OCIManifest

		for _, m := range manifest.Manifests {
			if m.Annotations == nil || m.Annotations["vnd.docker.reference.type"] == "" {
				filteredManifests = append(filteredManifests, m)
			}
		}

		// Sort manifests by digest for deterministic ordering
		sort.Slice(filteredManifests, func(i, j int) bool {
			// Check if there's a digest field in the manifest annotations
			digestI := ""
			digestJ := ""

			if filteredManifests[i].Annotations != nil && filteredManifests[i].Annotations["org.opencontainers.image.ref.name"] != "" {
				digestI = filteredManifests[i].Annotations["org.opencontainers.image.ref.name"]
			}

			if filteredManifests[j].Annotations != nil && filteredManifests[j].Annotations["org.opencontainers.image.ref.name"] != "" {
				digestJ = filteredManifests[j].Annotations["org.opencontainers.image.ref.name"]
			}

			return digestI < digestJ
		})

		manifest.Manifests = filteredManifests
	}

	// Ensure deterministic JSON stringification
	formattedJSON, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		log.Printf("Error marshaling filtered manifest: %v", err)
		return manifestJson, err
	}

	return string(formattedJSON), nil
}

// CalculateSHA256 calculates the SHA256 hash of a string after normalizing
// Similar to TypeScript calculateSha256 function
func CalculateSHA256(content string) string {
	// Remove all whitespace and newlines for consistent hashing
	normalized := strings.ReplaceAll(content, " ", "")
	normalized = strings.ReplaceAll(normalized, "\n", "")
	normalized = strings.ReplaceAll(normalized, "\r", "")
	normalized = strings.ReplaceAll(normalized, "\t", "")

	hash := sha256.Sum256([]byte(normalized))
	return fmt.Sprintf("sha256:%x", hash)
}

// GenerateManifestDigest creates a SHA256 digest from a manifest object
// Similar to TypeScript generateManifestDigest function
func GenerateManifestDigest(manifest interface{}) (string, error) {
	manifestJSON, err := json.Marshal(manifest)
	if err != nil {
		log.Printf("Error generating manifest JSON: %v", err)
		return fmt.Sprintf("sha256:error-generating-digest-%d", time.Now().Unix()), err
	}

	hash := sha256.Sum256(manifestJSON)
	return fmt.Sprintf("sha256:%x", hash), nil
}

// NormalizeAndCalculateManifestDigest takes raw manifest JSON and calculates the correct digest
// This combines both filtering and hash calculation
func NormalizeAndCalculateManifestDigest(manifestJSON string) string {
	// First filter out attestation manifests and ensure deterministic format
	filteredJSON, err := FilterAttestationManifests(manifestJSON)
	if err != nil {
		log.Printf("Warning: Error filtering attestations, using original manifest: %v", err)
		filteredJSON = manifestJSON
	}

	// Then calculate the SHA256 of the normalized content
	return CalculateSHA256(filteredJSON)
}

// GetCorrectDeleteDigest extracts the proper digest for deletion from headers and manifest
func GetCorrectDeleteDigest(contentDigestHeader string, manifestJSON string) string {
	// First try to use the Docker-Content-Digest header if available
	if contentDigestHeader != "" {
		// Remove any quotes from the header value
		contentDigestHeader = strings.ReplaceAll(contentDigestHeader, "\"", "")
		return contentDigestHeader
	}

	// If no header is available, calculate the digest from the manifest JSON
	return NormalizeAndCalculateManifestDigest(manifestJSON)
}

// GetPlatformSpecificManifest extracts the appropriate manifest for a given platform from an OCI index
func GetPlatformSpecificManifest(manifestJSON string, architecture string, os string) (string, error) {
	var manifest OCIManifest

	// Parse the manifest JSON
	if err := json.Unmarshal([]byte(manifestJSON), &manifest); err != nil {
		log.Printf("Error parsing manifest JSON: %v", err)
		return "", err
	}

	// Check if this is an OCI index or Docker manifest list
	if manifest.MediaType == "application/vnd.oci.image.index.v1+json" ||
		manifest.MediaType == "application/vnd.docker.distribution.manifest.list.v2+json" {

		// Look for the specified platform first
		for _, m := range manifest.Manifests {
			if m.Platform != nil &&
				m.Platform.Architecture == architecture &&
				m.Platform.OS == os {
				return m.Digest, nil
			}
		}

		// If no exact match, try to find a manifest without platform-specific attestations
		for _, m := range manifest.Manifests {
			if m.Annotations == nil || m.Annotations["vnd.docker.reference.type"] == "" {
				return m.Digest, nil
			}
		}

		// As a last resort, return the first manifest's digest
		if len(manifest.Manifests) > 0 {
			return manifest.Manifests[0].Digest, nil
		}

		return "", fmt.Errorf("no valid manifests found in index")
	}

	// If it's not an index, return an error
	return "", fmt.Errorf("not an OCI image index or Docker manifest list")
}
