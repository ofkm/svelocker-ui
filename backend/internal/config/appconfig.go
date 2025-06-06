package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
)

// AppConfig holds all configuration for the application
type AppConfig struct {
	Server   ServerConfig
	Database DatabaseConfig
	Registry RegistryConfig
	Logging  LoggingConfig
	Sync     SyncConfig
}

type ServerConfig struct {
	Host       string
	Port       int
	BackendUrl string
}

type RegistryConfig struct {
	URL      string
	Name     string
	Username string
	Password string
}

type LoggingConfig struct {
	Level string
}

type SyncConfig struct {
	Interval int // Interval in minutes
}

// NewAppConfig creates a new application configuration
func NewAppConfig() (*AppConfig, error) {
	return &AppConfig{
		Server: ServerConfig{
			Host:       getEnv("SERVER_HOST", "0.0.0.0"),
			Port:       getEnvAsInt("SERVER_PORT", 8080),
			BackendUrl: getEnv("PUBLIC_BACKEND_URL", "http://localhost:8080"),
		},
		Database: DatabaseConfig{
			Path: getEnv("DB_PATH", "data/svelockerui.db"),
		},
		Registry: RegistryConfig{
			URL:      getEnv("PUBLIC_REGISTRY_URL", "http://localhost:5000"),
			Name:     getEnv("PUBLIC_REGISTRY_NAME", "Local Registry"),
			Username: getEnv("REGISTRY_USERNAME", ""),
			Password: getEnv("REGISTRY_PASSWORD", ""),
		},
		Logging: LoggingConfig{
			Level: getEnv("PUBLIC_LOG_LEVEL", "INFO"),
		},
		Sync: SyncConfig{
			Interval: 5, // Default to 5 minutes, will be overridden by database value
		},
	}, nil
}

// Helper functions for environment variables
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func getEnvAsInt(key string, fallback int) int {
	if value, ok := os.LookupEnv(key); ok {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return fallback
}

// Validate checks if the configuration is valid
func (c *AppConfig) Validate() error {
	if c.Registry.URL == "" {
		return fmt.Errorf("registry URL is required")
	}

	dbDir := filepath.Dir(c.Database.Path)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return fmt.Errorf("failed to create database directory: %w", err)
	}

	return nil
}
