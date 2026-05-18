package handlers

import (
	"log"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
)

// RunInference triggers the Python inference script.
func RunInference(c *fiber.Ctx) error {
	type Request struct {
		PatientID string `json:"patient_id"`
		FilePath  string `json:"file_path"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.PatientID == "" {
		req.PatientID = "demo_patient"
	}
	if req.FilePath == "" {
		req.FilePath = "../SwinUNETR/dataset/test/image/demo.nii.gz"
	}

	inferenceScript := "../SwinUNETR/inference.py"
	absScript, err := filepath.Abs(inferenceScript)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Script path error"})
	}

	absInput, err := filepath.Abs(req.FilePath)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Input path error"})
	}

	absMeanStd, _ := filepath.Abs("../SwinUNETR/KIPA_Ts_Meanstd.npy")
	absOutputDir, _ := filepath.Abs(filepath.Join("../SwinUNETR/Results", req.PatientID))

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

	log.Printf("Running inference on %s", absInput)
	
	pythonBin, _ := filepath.Abs("../SwinUNETR/venv/bin/python")
	cmd := exec.Command(pythonBin, absScript, 
		"--input", absInput,
		"--mean_std", absMeanStd,
		"--weights", absWeights,
		"--out_dir", absOutputDir,
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		log.Printf("Inference failed: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Inference process failed"})
	}

	return c.JSON(fiber.Map{
		"message": "Inference completed successfully",
		"patient_id": req.PatientID,
		"results_dir": "/api/results/" + req.PatientID,
	})
}
