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
	for _, repoName := range repositories {
		if err := s.syncRepository(ctx, repoName); err != nil {
			log.Printf("Error syncing repository %s: %v", repoName, err)
			continue
		}
	}

	return nil
}

func (s *SyncService) syncRepository(ctx context.Context, repoName string) error {
	// Get or create repository
	repo, err := s.dockerRepo.GetRepository(ctx, repoName)
	if err != nil {
		return fmt.Errorf("failed to get repository: %w", err)
	}

	if repo == nil {
		repo = &models.Repository{
			Name: repoName,
		}
		if err := s.dockerRepo.CreateRepository(ctx, repo); err != nil {
			return fmt.Errorf("failed to create repository: %w", err)
		}
	}

	// Get list of tags for this repository
	tags, err := s.registry.ListTags(ctx, repoName)
	if err != nil {
		return fmt.Errorf("failed to list tags: %w", err)
	}

	// Process each tag
	for _, tagName := range tags {
		if err := s.syncTag(ctx, repo, tagName); err != nil {
			log.Printf("Error syncing tag %s in repository %s: %v", tagName, repoName, err)
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

func (s *SyncService) syncTag(ctx context.Context, repo *models.Repository, tagName string) error {
	// Get manifest for this tag
	manifest, err := s.registry.GetManifest(ctx, repo.Name, tagName)
	if err != nil {
		return fmt.Errorf("failed to get manifest: %w", err)
	}

	// Get config for this image
	config, err := s.registry.GetConfig(ctx, repo.Name, manifest.Config.Digest)
	if err != nil {
		return fmt.Errorf("failed to get config: %w", err)
	}

	// Parse image name from repository
	// For example: "library/ubuntu" -> "ubuntu"
	imageName := repo.Name
	if parts := strings.Split(repo.Name, "/"); len(parts) > 1 {
		imageName = parts[len(parts)-1]
	}

	// Get or create image
	image, err := s.imageRepo.GetImage(ctx, repo.Name, imageName)
	if err != nil {
		return fmt.Errorf("failed to get image: %w", err)
	}

	if image == nil {
		image = &models.Image{
			RepositoryID: repo.ID,
			Name:         imageName,
			FullName:     repo.Name,
		}
		if err := s.imageRepo.CreateImage(ctx, image); err != nil {
			return fmt.Errorf("failed to create image: %w", err)
		}
	}

	// Get or create tag
	tag, err := s.tagRepo.GetTag(ctx, repo.Name, imageName, tagName)
	if err != nil {
		return fmt.Errorf("failed to get tag: %w", err)
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
			return fmt.Errorf("failed to create tag: %w", err)
		}
	} else {
		// Update existing tag if digest has changed
		if tag.Digest != manifest.Config.Digest {
			tag.Digest = manifest.Config.Digest
			tag.Metadata.Created = config.Created
			tag.Metadata.OS = config.OS
			tag.Metadata.Architecture = config.Architecture
			tag.Metadata.Author = config.Author
			tag.Metadata.WorkDir = config.Config.WorkingDir
			tag.Metadata.Command = cmd
			tag.Metadata.Entrypoint = entrypoint
			tag.Metadata.TotalSize = manifest.Config.Size
			tag.Metadata.ExposedPorts = strings.Join(exposedPorts, ",")

			// Update layers
			tag.Metadata.Layers = []models.ImageLayer{}
			for _, layer := range manifest.Layers {
				tag.Metadata.Layers = append(tag.Metadata.Layers, models.ImageLayer{
					Size:   layer.Size,
					Digest: layer.Digest,
				})
			}

			if err := s.tagRepo.UpdateTag(ctx, tag); err != nil {
				return fmt.Errorf("failed to update tag: %w", err)
			}
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
