package config

import (
	"fmt"
	"os"
	"path/filepath"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DatabaseConfig holds the configuration for the database
type DatabaseConfig struct {
	Path string
}

// NewDatabaseConfig creates a new database configuration
func NewDatabaseConfig() *DatabaseConfig {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "data/svelockerui.db"
	}

	// Ensure the directory exists
	dbDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		fmt.Printf("Failed to create database directory: %v\n", err)
	}

	return &DatabaseConfig{
		Path: dbPath,
	}
}

// Connect establishes a connection to the database
func (c *DatabaseConfig) Connect(logLevel string) (*gorm.DB, error) {
	config := &gorm.Config{
		Logger: logger.Default.LogMode(parseLogLevel(logLevel)),
	}

	db, err := gorm.Open(sqlite.Open(c.Path), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Set connection pool settings
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	// Configure connection pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	return db, nil
}

// parseLogLevel converts a string log level to gorm logger.LogLevel
func parseLogLevel(level string) logger.LogLevel {
	switch level {
	case "DEBUG":
		return logger.Info
	case "INFO":
		return logger.Info
	case "WARN":
		return logger.Warn
	case "ERROR":
		return logger.Error
	default:
		return logger.Info
	}
}
