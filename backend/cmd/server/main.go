package main

import (
	"context"
	"fmt"
	"log"

	"github.com/ofkm/svelocker-ui/backend/internal/bootstrap"
)

func main() {
	// Create context
	ctx := context.Background()

	// Bootstrap the application
	app, err := bootstrap.Bootstrap(ctx)
	if err != nil {
		log.Fatal("Failed to bootstrap application:", err)
	}

	// Start server
	serverAddr := fmt.Sprintf("%s:%d", app.Config.Server.Host, app.Config.Server.Port)
	if err := app.Router.Run(serverAddr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
