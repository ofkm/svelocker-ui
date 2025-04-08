package services

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/ofkm/svelocker-ui/backend/internal/models"
	"github.com/ofkm/svelocker-ui/backend/internal/repository"
)

type SyncService struct {
	mu         sync.Mutex
	isSyncing  bool
	dockerRepo repository.DockerRepository
	imageRepo  repository.ImageRepository
	tagRepo    repository.TagRepository
	configRepo repository.ConfigRepository
	registry   *RegistryClient
	ticker     *time.Ticker
	stopChan   chan struct{}
}

func NewSyncService(
	dockerRepo repository.DockerRepository,
	imageRepo repository.ImageRepository,
	tagRepo repository.TagRepository,
	configRepo repository.ConfigRepository,
	registryURL string,
	username string,
	password string,
) *SyncService {
	return &SyncService{
		dockerRepo: dockerRepo,
		imageRepo:  imageRepo,
		tagRepo:    tagRepo,
		configRepo: configRepo,
		registry:   NewRegistryClient(registryURL, username, password),
		stopChan:   make(chan struct{}),
	}
}

func (s *SyncService) Start(ctx context.Context) error {
	// Get sync interval from config
	syncConfig, err := s.configRepo.Get(ctx, "sync_interval")
	if err != nil {
		return fmt.Errorf("failed to get sync interval config: %w", err)
	}

	// Default to 5 minutes if not set
	interval := 5
	if syncConfig != nil {
		if i, err := strconv.Atoi(syncConfig.Value); err == nil {
			interval = i
		}
	}

	s.ticker = time.NewTicker(time.Duration(interval) * time.Minute)

	// Start sync loop
	go func() {
		// Perform initial sync
		if err := s.PerformSync(ctx); err != nil {
			log.Printf("Initial sync failed: %v", err)
		}

		for {
			select {
			case <-s.ticker.C:
				if err := s.PerformSync(ctx); err != nil {
					log.Printf("Periodic sync failed: %v", err)
				}
			case <-s.stopChan:
				s.ticker.Stop()
				return
			case <-ctx.Done():
				s.ticker.Stop()
				return
			}
		}
	}()

	return nil
}

func (s *SyncService) Stop() {
	close(s.stopChan)
}

func (s *SyncService) PerformSync(ctx context.Context) error {
	s.mu.Lock()
	if s.isSyncing {
		s.mu.Unlock()
		return fmt.Errorf("sync already in progress")
	}
	s.isSyncing = true
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		s.isSyncing = false
		s.mu.Unlock()
	}()

	// Update last sync time
	now := time.Now()
	if err := s.configRepo.Update(ctx, "last_sync_time", fmt.Sprintf("%d", now.Unix())); err != nil {
		return fmt.Errorf("failed to update last sync time: %w", err)
	}

	// Get list of repositories from registry
	repositories, err := s.registry.ListRepositories(ctx)
	if err != nil {
		return fmt.Errorf("failed to list repositories: %w", err)
	}

	// Process each repository
	for _, repoPath := range repositories {
		if err := s.syncRepository(ctx, repoPath); err != nil {
			log.Printf("Error syncing repository %s: %v", repoPath, err)
			continue
		}
	}

	return nil
}

// Update the syncRepository function to parse namespace and image name correctly
func (s *SyncService) syncRepository(ctx context.Context, repoPath string) error {
	log.Printf("Starting sync for repository: %s", repoPath)

	// Extract namespace from the full path
	namespace := "library" // Default namespace like Docker Hub uses
	imageName := repoPath
	if strings.Contains(repoPath, "/") {
		parts := strings.SplitN(repoPath, "/", 2)
		namespace = parts[0]
		imageName = parts[1]
	}

	// Get or create repository (namespace)
	repo, err := s.dockerRepo.GetRepository(ctx, namespace)
	if err != nil {
		return fmt.Errorf("failed to get repository namespace: %w", err)
	}

	if repo == nil {
		repo = &models.Repository{
			Name: namespace,
		}
		if err := s.dockerRepo.CreateRepository(ctx, repo); err != nil {
			return fmt.Errorf("failed to create repository namespace: %w", err)
		}
	}

	// Get or create image within this repository
	image, err := s.imageRepo.GetImage(ctx, namespace, imageName)
	if err != nil {
		return fmt.Errorf("failed to get image: %w", err)
	}

	if image == nil {
		image = &models.Image{
			RepositoryID: repo.ID,
			Name:         imageName,
			FullName:     repoPath, // Keep the full path in FullName
		}
		if err := s.imageRepo.CreateImage(ctx, image); err != nil {
			return fmt.Errorf("failed to create image: %w", err)
		}
	}

	// Get list of tags for this image
	log.Printf("Fetching tags for %s", repoPath)
	tags, err := s.registry.ListTags(ctx, repoPath)
	if err != nil {
		return fmt.Errorf("failed to list tags: %w", err)
	}
	log.Printf("Found %d tags for %s", len(tags), repoPath)

	// Process each tag
	for _, tagName := range tags {
		log.Printf("Processing tag %s for repo %s", tagName, repoPath)
		if err := s.syncTag(ctx, repo, image, namespace+"/"+imageName, tagName); err != nil {
			log.Printf("Error syncing tag %s in repository %s: %v", tagName, repoPath, err)
			continue
		}
	}

	// Update repository last sync time
	repo.LastSynced = time.Now()
	if err := s.dockerRepo.UpdateRepository(ctx, repo); err != nil {
		return fmt.Errorf("failed to update repository: %w", err)
	}

	return nil
}

// Update syncTag to handle specific error scenarios
func (s *SyncService) syncTag(ctx context.Context, repo *models.Repository, image *models.Image, repoPath string, tagName string) error {
	// Get manifest for this tag
	manifest, err := s.registry.GetManifest(ctx, repoPath, tagName)
	if err != nil {
		// If we get a 404 for the manifest, this might be expected for deleted tags
		if strings.Contains(err.Error(), "404") {
			log.Printf("Tag %s in repository %s no longer exists in registry, skipping", tagName, repoPath)
			return nil
		}
		return fmt.Errorf("failed to get manifest: %w", err)
	}

	// Check if the manifest is a manifest list
	if manifest.MediaType == "application/vnd.oci.image.index.v1+json" || manifest.MediaType == "application/vnd.docker.distribution.manifest.list.v2+json" {
		log.Printf("Tag %s in repository %s is a manifest list, processing entries", tagName, repoPath)

		// Iterate through the manifests in the list
		for _, m := range manifest.Manifests {
			// Fetch the manifest for this entry
			platformManifest, err := s.registry.GetManifest(ctx, repoPath, m.Digest)
			if err != nil {
				log.Printf("Failed to fetch manifest for digest %s: %v", m.Digest, err)
				continue
			}

			// Process the platform-specific manifest
			if err := s.processManifest(ctx, repo, image, repoPath, tagName, platformManifest); err != nil {
				log.Printf("Failed to process manifest for digest %s: %v", m.Digest, err)
				continue
			}
		}

		return nil
	}

	// Process the single manifest
	return s.processManifest(ctx, repo, image, repoPath, tagName, manifest)
}

func (s *SyncService) processManifest(ctx context.Context, repo *models.Repository, image *models.Image, repoPath string, tagName string, manifest *ManifestResponse) error {
	// Check if the manifest actually has a config
	if manifest.Config.Digest == "" {
		log.Printf("Manifest for tag %s in repository %s has no config digest", tagName, repoPath)

		// Create a minimal tag record
		tag := &models.Tag{
			ImageID: image.ID,
			Name:    tagName,
			Digest:  "", // Set digest to empty string
		}

		if err := s.tagRepo.CreateTag(ctx, tag); err != nil {
			return fmt.Errorf("failed to create minimal tag: %w", err)
		}

		return nil
	}

	// Get config for this image
	config, err := s.registry.GetConfig(ctx, repoPath, manifest.Config.Digest)
	if err != nil {
		// If we get a 404 for the config, this might be a schema v1 image
		if strings.Contains(err.Error(), "404") {
			log.Printf("Config %s for tag %s in repository %s not found, might be schema v1",
				manifest.Config.Digest, tagName, repoPath)

			// For schema v1, we might want to create a minimal tag record
			tag := &models.Tag{
				ImageID: image.ID,
				Name:    tagName,
				Digest:  manifest.Config.Digest,
			}

			if err := s.tagRepo.CreateTag(ctx, tag); err != nil {
				return fmt.Errorf("failed to create minimal tag: %w", err)
			}

			return nil
		}
		return fmt.Errorf("failed to get config: %w", err)
	}

	// Convert exposed ports to string
	var exposedPorts []string
	for port := range config.Config.ExposedPorts {
		exposedPorts = append(exposedPorts, port)
	}

	// Convert command and entrypoint arrays to strings
	var cmd, entrypoint string
	if len(config.Config.Cmd) > 0 {
		cmd = strings.Join(config.Config.Cmd, " ")
	}
	if len(config.Config.Entrypoint) > 0 {
		entrypoint = strings.Join(config.Config.Entrypoint, " ")
	}

	// Extract Dockerfile from history entries - simplified version matching TypeScript
	var dockerCommands []string
	if len(config.History) > 0 {
		for _, historyEntry := range config.History {
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
	}

	dockerFileContent := "No Dockerfile found"
	if len(dockerCommands) > 0 {
		dockerFileContent = strings.Join(dockerCommands, "\n")
	}

	// Add debug logging
	log.Printf("Generated Dockerfile content:\n%s", dockerFileContent)

	// Update tag reference to be against the image
	tag, err := s.tagRepo.GetTag(ctx, repo.Name, image.Name, tagName)
	if err != nil {
		return fmt.Errorf("failed to get tag: %w", err)
	}

	if tag == nil {
		tag = &models.Tag{
			ImageID: image.ID,
			Name:    tagName,
			Digest:  manifest.Config.Digest,
			Metadata: models.TagMetadata{
				Created:      config.Created,
				OS:           config.OS,
				Architecture: config.Architecture,
				Author:       config.Author,
				WorkDir:      config.Config.WorkingDir,
				Command:      cmd,
				Entrypoint:   entrypoint,
				TotalSize:    manifest.Config.Size,
				ExposedPorts: strings.Join(exposedPorts, ","),
				DockerFile:   dockerFileContent, // Make sure this is being set
			},
		}

		// Add layers
		for _, layer := range manifest.Layers {
			tag.Metadata.Layers = append(tag.Metadata.Layers, models.ImageLayer{
				Size:   layer.Size,
				Digest: layer.Digest,
			})
		}

		if err := s.tagRepo.CreateTag(ctx, tag); err != nil {
			log.Printf("Failed to create tag: %v", err)
			return fmt.Errorf("failed to create tag: %w", err)
		}
	} else {
		// Update existing tag
		tag.Metadata.DockerFile = dockerFileContent // Make sure this is being set for updates too
		if err := s.tagRepo.UpdateTag(ctx, tag); err != nil {
			log.Printf("Failed to update tag: %v", err)
			return fmt.Errorf("failed to update tag: %w", err)
		}
	}

	return nil
}

func (s *SyncService) GetLastSyncTime(ctx context.Context) (*time.Time, error) {
	config, err := s.configRepo.Get(ctx, "last_sync_time")
	if err != nil {
		return nil, err
	}
	if config == nil {
		return nil, nil
	}

	timestamp, err := strconv.ParseInt(config.Value, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid last sync time format: %w", err)
	}

	t := time.Unix(timestamp, 0)
	return &t, nil
}
