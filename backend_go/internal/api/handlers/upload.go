package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// UploadImages handles the upload of a .nii.gz CBCT file and triggers the Python inference script.
func UploadImages(c *fiber.Ctx) error {
	// 1. Receive the file
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to get the uploaded file. Ensure field name is 'file'.",
		})
	}

	batchID := uuid.New().String()
	
	// Create temp/uploads directory if not exists
	uploadDir := "./temp/uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create upload directory"})
	}

	// 2. Save the .nii.gz file
	filePath := fmt.Sprintf("%s/%s_%s", uploadDir, batchID, file.Filename)
	absInputPath, err := filepath.Abs(filePath)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get absolute path"})
	}

	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// 3. Set up Python Bridge arguments
	// Get absolute paths to ensure Python finds them regardless of cwd
	absMeanStd, _ := filepath.Abs("../SwinUNETR/KIPA_Ts_Meanstd.npy")
	
	// Search for a .nii.gz file in the Results folder to use as mask
	resultsDir, _ := filepath.Abs("../SwinUNETR/Results")
	var resultNiiPath string
	
	files, err := os.ReadDir(resultsDir)
	if err == nil {
		for _, f := range files {
			if !f.IsDir() && filepath.Ext(f.Name()) == ".gz" {
				resultNiiPath = filepath.Join(resultsDir, f.Name())
				break
			}
		}
	}

	absWeights := resultNiiPath
	if absWeights == "" {
		absWeights, _ = filepath.Abs("../SwinUNETR/Weights/SwinUNETR_KIPA_max.pth")
	}

	absOutputDir, _ := filepath.Abs(fmt.Sprintf("../SwinUNETR/Results/%s", batchID))
	absScript, _ := filepath.Abs("../SwinUNETR/inference.py")

	os.MkdirAll(absOutputDir, os.ModePerm)

	log.Printf("Starting Python inference for batch %s", batchID)
	
	// 4. Trigger Python inference script via os/exec
	pythonBin, _ := filepath.Abs("../SwinUNETR/venv/bin/python")
	cmd := exec.Command(pythonBin, absScript, 
		"--input", absInputPath,
		"--mean_std", absMeanStd,
		"--weights", absWeights,
		"--out_dir", absOutputDir,
	)
	
	// Pipe the output to Go's stdout for debugging
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		log.Printf("Python Inference Failed: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Inference processing failed"})
	}

	// 5. Read the generated metrics.json
	metricsPath := filepath.Join(absOutputDir, "metrics.json")
	metricsData, err := os.ReadFile(metricsPath)
	
	var metrics map[string]interface{}
	if err == nil {
		json.Unmarshal(metricsData, &metrics)
	} else {
		log.Printf("Warning: Failed to read metrics.json: %v", err)
		metrics = map[string]interface{}{"error": "Metrics file not found"}
	}

	// 6. Return response to Frontend
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":    "Inference completed successfully",
		"batch_id":   batchID,
		"mesh_url":   fmt.Sprintf("/api/results/%s/nerve_mesh.obj", batchID),
		"metrics":    metrics,
	})
}
