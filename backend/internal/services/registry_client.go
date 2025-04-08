package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

type RegistryClient struct {
	baseURL  string
	username string
	password string
	client   *http.Client
}

type RegistryCatalog struct {
	Repositories []string `json:"repositories"`
}

type ManifestResponse struct {
	SchemaVersion int    `json:"schemaVersion"`
	MediaType     string `json:"mediaType"`
	Config        struct {
		MediaType string `json:"mediaType"`
		Digest    string `json:"digest"`
		Size      int64  `json:"size"`
	} `json:"config"`
	Layers []struct {
		MediaType string `json:"mediaType"`
		Digest    string `json:"digest"`
		Size      int64  `json:"size"`
	} `json:"layers"`
	Manifests []struct {
		MediaType string `json:"mediaType"`
		Digest    string `json:"digest"`
		Size      int64  `json:"size"`
		Platform  struct {
			Architecture string `json:"architecture"`
			OS           string `json:"os"`
		} `json:"platform"`
	} `json:"manifests,omitempty"`
}

type ConfigResponse struct {
	Architecture string `json:"architecture"`
	Created      string `json:"created"`
	Author       string `json:"author"`
	OS           string `json:"os"`
	Config       struct {
		WorkingDir   string              `json:"WorkingDir"`
		Cmd          []string            `json:"Cmd"`
		Entrypoint   []string            `json:"Entrypoint"`
		ExposedPorts map[string]struct{} `json:"ExposedPorts"`
	} `json:"config"`
	History []struct {
		Created    string `json:"created"`
		CreatedBy  string `json:"created_by"`
		Author     string `json:"author"`
		Comment    string `json:"comment"`
		EmptyLayer bool   `json:"empty_layer"`
	} `json:"history"`
}

func NewRegistryClient(baseURL, username, password string) *RegistryClient {
	client := &http.Client{
		Timeout: time.Minute * 5,
	}

	// Add debug logging
	log.Printf("Creating registry client for %s with username %s", baseURL, username)

	return &RegistryClient{
		baseURL:  strings.TrimSuffix(baseURL, "/"),
		username: username,
		password: password,
		client:   client,
	}
}

func (c *RegistryClient) ListRepositories(ctx context.Context) ([]string, error) {
	url := fmt.Sprintf("%s/v2/_catalog", c.baseURL)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	if c.username != "" && c.password != "" {
		req.SetBasicAuth(c.username, c.password)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("registry returned status %d", resp.StatusCode)
	}

	var catalog RegistryCatalog
	if err := json.NewDecoder(resp.Body).Decode(&catalog); err != nil {
		return nil, err
	}

	return catalog.Repositories, nil
}

// Update ListTags to provide better error reporting and handle path correctly
func (c *RegistryClient) ListTags(ctx context.Context, repository string) ([]string, error) {
	// Make sure repository is correctly formatted (no leading or trailing slashes)
	repository = strings.Trim(repository, "/")

	url := fmt.Sprintf("%s/v2/%s/tags/list", c.baseURL, repository)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Add("Accept", "application/vnd.docker.distribution.manifest.v2+json")

	if c.username != "" && c.password != "" {
		req.SetBasicAuth(c.username, c.password)
	}

	// Add debug logging
	log.Printf("Sending request to: %s", url)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("Registry error for %s: status=%d, body=%s", url, resp.StatusCode, string(bodyBytes))
		return nil, fmt.Errorf("registry returned status %d for %s: %s",
			resp.StatusCode, url, string(bodyBytes))
	}

	var result struct {
		Name string   `json:"name"`
		Tags []string `json:"tags"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// If no tags field or it's null, return empty slice rather than nil
	if result.Tags == nil {
		log.Printf("Repository %s exists but has no tags", repository)
		return []string{}, nil
	}

	return result.Tags, nil
}

// Similarly update GetManifest and GetConfig with better error handling
func (c *RegistryClient) GetManifest(ctx context.Context, repository, tag string) (*ManifestResponse, error) {
	repository = strings.Trim(repository, "/")

	url := fmt.Sprintf("%s/v2/%s/manifests/%s", c.baseURL, repository, tag)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Add("Accept", "application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json")
	if c.username != "" && c.password != "" {
		req.SetBasicAuth(c.username, c.password)
	}

	log.Printf("Fetching manifest from: %s", url)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("Manifest error for %s: status=%d, body=%s", url, resp.StatusCode, string(bodyBytes))
		return nil, fmt.Errorf("registry returned status %d for manifest %s: %s",
			resp.StatusCode, url, string(bodyBytes))
	}

	var manifest ManifestResponse
	if err := json.NewDecoder(resp.Body).Decode(&manifest); err != nil {
		return nil, fmt.Errorf("failed to decode manifest: %w", err)
	}

	return &manifest, nil
}

func (c *RegistryClient) GetConfig(ctx context.Context, repository, digest string) (*ConfigResponse, error) {
	url := fmt.Sprintf("%s/v2/%s/blobs/%s", c.baseURL, repository, digest)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	if c.username != "" && c.password != "" {
		req.SetBasicAuth(c.username, c.password)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("registry returned status %d", resp.StatusCode)
	}

	var config ConfigResponse
	if err := json.NewDecoder(resp.Body).Decode(&config); err != nil {
		return nil, err
	}

	return &config, nil
}
