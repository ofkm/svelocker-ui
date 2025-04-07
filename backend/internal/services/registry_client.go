package services

import (
	"context"
	"encoding/json"
	"fmt"
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
		Size      int64  `json:"size"`
		Digest    string `json:"digest"`
	} `json:"config"`
	Layers []struct {
		MediaType string `json:"mediaType"`
		Size      int64  `json:"size"`
		Digest    string `json:"digest"`
	} `json:"layers"`
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
	return &RegistryClient{
		baseURL:  strings.TrimSuffix(baseURL, "/"),
		username: username,
		password: password,
		client: &http.Client{
			Timeout: time.Second * 30,
		},
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

func (c *RegistryClient) ListTags(ctx context.Context, repository string) ([]string, error) {
	url := fmt.Sprintf("%s/v2/%s/tags/list", c.baseURL, repository)
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

	var result struct {
		Tags []string `json:"tags"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result.Tags, nil
}

func (c *RegistryClient) GetManifest(ctx context.Context, repository, tag string) (*ManifestResponse, error) {
	url := fmt.Sprintf("%s/v2/%s/manifests/%s", c.baseURL, repository, tag)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Accept", "application/vnd.docker.distribution.manifest.v2+json")
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

	var manifest ManifestResponse
	if err := json.NewDecoder(resp.Body).Decode(&manifest); err != nil {
		return nil, err
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
