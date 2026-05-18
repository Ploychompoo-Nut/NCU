# HealthScan: Core 3D Reconstruction System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-blueviolet?logo=react)
![Go](https://img.shields.io/badge/Go-1.21-00ADD8?logo=go)
![FastAPI](https://img.shields.io/badge/FastAPI-1.2.0-009688?logo=fastapi)

HealthScan is an advanced medical imaging dashboard and 2D-to-3D vascular reconstruction system. With an emphasis on high performance and a rich, glassmorphism-inspired UI, HealthScan allows medical professionals to queue patients, interact with 3D mesh projections seamlessly in-browser, and extract precise diagnostic metrics with zero wait time.

## 🏗 System Architecture

HealthScan encompasses three modular components perfectly integrated for maximum edge-computing performance:

### 1. Vision Frontend (`/src`)
A stunning, responsive React/Vite web application built with **Ant Design**. It handles data visualization, UI tracking, and utilizes **React Three Fiber / Drei** for performing heavy WebGL-based rendering of 3D mathematical vessels natively in the client browser.

### 2. High-Performance Processing Node (`/backend_go`)
A robust architecture using standard Go layout, built with the **Fiber** web framework. 
- Utilizes **Gonum** for heavy linear algebra computations.
- Leverages **GoCV** for C++ level computer vision interactions via Go.
- Implements a parallel execution layer via a highly efficient Goroutine Worker Pool pattern to slash 3D coordinate point reconstruction latency drastically.

### 3. Data Hub (`/backend`)
A legacy lightweight Python FastAPI service handling mock configurations, testing environments, and historical patient status aggregation metrics.

---

## 🚀 Quickstart

### Prerequisites
- **Node.js** (v18+)
- **Go** (v1.21+) - *Requires OpenCV installed locally for GoCV CGO compiling.*
- **Python** (v3.9+)

### Local Development

1. **Frontend Server**
    ```sh
    npm install
    npm run dev
    ```
    *Access at [http://localhost:5173](http://localhost:5173).*

2. **Golang Worker Hub**
    ```sh
    cd backend_go
    go mod tidy
    go run cmd/server/main.go
    ```
    *API loads on port 8080.*

3. **FastAPI Data Layer**
    ```sh
    cd backend
    uvicorn main:app --reload --port 8000
    ```

---

## 🎨 UI/UX Specifications
- **Dynamic Glassmorphism**: Provides depth without compromising text accessibility.
- **Real-time Pipeline**: Dynamic statistic cards track patients seamlessly from queueing to generation logic completion.
- **Interactive 3D**: Granular point-cloud manipulation enabled natively in-app for surgical references.

*Project architecture generated and documented by advanced AI engineering.*
