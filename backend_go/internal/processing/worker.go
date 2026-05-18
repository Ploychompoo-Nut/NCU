package processing

import (
	"log"
	"sync"
	"time"

	"backend_go/internal/models"
	"backend_go/internal/processing/image"
)

// Job represents an image processing task
type Job struct {
	FilePath string
}

// Result represents the extracted data from an image
type Result struct {
	FilePath     string
	FeatureCount int
	Error        error
}

// ProcessBatch simulates processing a batch of images concurrently.
// It uses a worker pool pattern for high performance.
func ProcessBatch(batchID string, files []string) {
	log.Printf("[Batch %s] Starting parallel processing for %d files", batchID, len(files))
	startTime := time.Now()

	numWorkers := 4 // Scale based on CPU cores
	jobs := make(chan Job, len(files))
	results := make(chan Result, len(files))

	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	// Send jobs
	for _, file := range files {
		jobs <- Job{FilePath: file}
	}
	close(jobs)

	// Wait for workers to finish in a separate goroutine so we can close results
	go func() {
		wg.Wait()
		close(results)
	}()

	// Aggregate Results
	totalFeatures := 0
	for res := range results {
		if res.Error != nil {
			log.Printf("Error processing %s: %v", res.FilePath, res.Error)
			continue
		}
		totalFeatures += res.FeatureCount
	}

	log.Printf("[Batch %s] Completed in %s. Total Features Extracted: %d", batchID, time.Since(startTime), totalFeatures)
	
	// Once features are extracted, pass to Reconstruction (Math logic with Gonum)
	// reconstruction.CalculateTransform(...) 
}

func worker(id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		log.Printf("Worker %d processing file: %s", id, j.FilePath)
		
		// Simulate computation time and vision processing
		time.Sleep(500 * time.Millisecond)
		count, err := image.ExtractFeatures(j.FilePath)

		results <- Result{
			FilePath:     j.FilePath,
			FeatureCount: count,
			Error:        err,
		}
	}
}
