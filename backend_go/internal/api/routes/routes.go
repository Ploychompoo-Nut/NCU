package routes

import (
	"backend_go/internal/api/handlers"
	"github.com/gofiber/fiber/v2"
)

// SetupRoutes registers the API endpoints.
func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "3D-Reconstruction-Go"})
	})

	api.Post("/upload", handlers.UploadImages)
	api.Post("/inference", handlers.RunInference)
}
