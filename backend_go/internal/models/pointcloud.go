package models

// Point3D represents a single point in 3D space with RGB color data.
type Point3D struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
	R uint8   `json:"r"`
	G uint8   `json:"g"`
	B uint8   `json:"b"`
}

// PointCloud represents an aggregated collection of points.
type PointCloud struct {
	ID     string    `json:"id"`
	Points []Point3D `json:"points"`
}

// ImageBatch represents a sequence of images to be processed for reconstruction.
type ImageBatch struct {
	ID     string   `json:"id"`
	Files  []string `json:"files"` // File paths or Base64 data
}
