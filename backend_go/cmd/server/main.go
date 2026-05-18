package main

import (
	"log"
	"os"

	"backend_go/internal/api/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Initialize Fiber App
	app := fiber.New(fiber.Config{
		AppName:           "UI-3DReconstruction (Go)",
		EnablePrintRoutes: true,
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Adjust depending on frontend URL
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Static Files mapping for the Frontend
	// Expects you have built your Vite app to /web/dist
	if _, err := os.Stat("../web/dist"); err == nil {
		app.Static("/", "../web/dist")
	} else {
		log.Println("Frontend build not found at ../web/dist. API will run independently.")
	}

	// Serve the Inference Results statically
	app.Static("/api/results", "../SwinUNETR/Results")

	// Make sure upload directory exists
	os.MkdirAll("./uploads", os.ModePerm)

	// API Routes Setup
	routes.SetupRoutes(app)

	// Start Web Server
	port := "8080"
	log.Printf("Starting Fiber server on port %s", port)
	
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
