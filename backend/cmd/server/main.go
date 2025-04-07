package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ofkm/svelocker-ui/backend/internal/bootstrap"
)

func main() {
	// Create context that can be cancelled on shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Bootstrap the application
	app, err := bootstrap.Bootstrap(ctx)
	if err != nil {
		log.Fatal("Failed to bootstrap application:", err)
	}
	defer app.Close()

	// Create HTTP server
	server := &http.Server{
		Addr:    fmt.Sprintf("%s:%d", app.Config.Server.Host, app.Config.Server.Port),
		Handler: app.Router,
	}

	// Channel to listen for errors coming from the server
	serverErrors := make(chan error, 1)

	// Start server
	go func() {
		log.Printf("Server listening on %s", server.Addr)
		serverErrors <- server.ListenAndServe()
	}()

	// Channel to listen for interrupt signals
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	// Block until we receive a shutdown signal or server error
	select {
	case err := <-serverErrors:
		log.Fatal("Server error:", err)

	case <-shutdown:
		log.Println("Starting graceful shutdown...")

		// Create shutdown context with timeout
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()

		// Trigger application cleanup
		if err := app.Close(); err != nil {
			log.Printf("Error during cleanup: %v", err)
		}

		// Shutdown server
		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("Error during server shutdown: %v", err)
			server.Close()
		}
	}
}
