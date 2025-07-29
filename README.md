<!-- PROJECT BANNER -->

<h1 align="center">V8 Engine Digital Twin Simulator 🚗💨</h1>

<p align="center">
  <b>Real-time, interactive, and visually rich digital twin of a V8 engine-powered car</b>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Next.js-14.2.3-blue?logo=nextdotjs"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Three.js-0.169.0-black?logo=three.js"/></a>
  <a href="#"><img src="https://img.shields.io/badge/MongoDB-6.6.0-green?logo=mongodb"/></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-yellow.svg"/></a>
</p>

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Physics & Engine Simulation](#physics--engine-simulation)
- [3D Visualization & UI Components](#3d-visualization--ui-components)
- [Backend API & Data Model](#backend-api--data-model)
- [Data Analytics & Metrics](#data-analytics--metrics)
- [Setup & Development](#setup--development)
- [Extensibility & Customization](#extensibility--customization)
- [Troubleshooting & Tips](#troubleshooting--tips)
- [Future Enhancements](#future-enhancements)
- [Credits & License](#credits--license)

---

## 🚀 Project Overview

A full-stack, real-time digital twin simulator of a V8 engine-powered car. This project combines:

- ⚙️ **Physics-based engine and car dynamics simulation**
- 🖥️ **Real-time 3D visualization with interactive controls**
- 📊 **Live telemetry, analytics, and performance metrics**
- 🌐 **RESTful backend with persistent session and state management**
- 🧩 **Modular, extensible architecture for research and prototyping**

---

## 🏗️ Architecture

```mermaid
graph TD;
  A[Frontend (Next.js + React + Three.js)] -->|HTTP/API| B[Backend (Node.js + MongoDB)]
  B --> C[Database (MongoDB Collections)]
```

- **Frontend**: Interactive 3D visualization, UI controls, real-time telemetry
- **Backend**: REST API for state, metrics, and analytics; MongoDB for persistence
- **Physics Engine**: Custom logic for engine, transmission, temperature, fuel, and performance

---

## 🛠️ Technology Stack

| Layer     | Technology                                                    |
| --------- | ------------------------------------------------------------- |
| Frontend  | Next.js 14.2.3, React 18, Three.js 0.169.0, React Three Fiber |
| Styling   | Tailwind CSS 3.4.1, Radix UI, Lucide React                    |
| Backend   | Node.js (API routes in Next.js), MongoDB 6.6.0                |
| Utilities | UUID, Yarn, ESLint, PostCSS, Autoprefixer                     |

---

## ✨ Features

- **Physically-based V8 engine simulation**
- **Interactive 3D car model with real-time feedback**
- **Live telemetry dashboard and analytics**
- **Session-based state persistence and metrics**
- **Performance modes: Efficiency & Power**
- **Dynamic temperature, fuel, and brake systems**
- **Extensible UI and backend**

---

## ⚙️ Physics & Engine Simulation

> Implemented in [`lib/carDynamics.js`](lib/carDynamics.js)

### Engine & Transmission

- **Specs**: V8, 8 pistons, 2 strokes, idle 800 RPM, max 8400 RPM, 700hp, 850Nm
- **Gearbox**: P, R, N, D, 1-5 with realistic gear ratios and final drive
- **Horsepower-Speed Mapping**: Maps power output to speed bands
- **Wheel RPM Mapping**: Maps speed to wheel RPM for animation

### Dynamic Systems

- **Temperature**: Simulates heat buildup, cooling, and color-coded feedback
- **Fuel System**: Tank size, consumption rate, range calculation
- **Braking**: Hydraulic brake release, light effects, response time
- **Pedal States**: Accelerator and brake, with real-time effect on simulation

### Performance Analysis

- **Efficiency Scoring**: Real-time calculation based on RPM, temp, gear, and speed
- **Mode Switching**: EFFICIENCY vs POWER, with dynamic recommendations
- **History Tracking**: Stores recent RPM, temp, horsepower, and fuel data

#### Example: Calculating RPM

```js
const car = new CarDynamics();
const rpm = car.calculateRPM(speed, gear, engineRunning);
```

---

## 🖥️ 3D Visualization & UI Components

> All UI and visualization logic is in [`components/`](components/)

### Car & Scene

- **CarModel.jsx**: Loads and animates the GLB 3D car model, applies temperature-based color changes, and updates wheel rotation.
- **CarScene.jsx**: Sets up the Three.js scene, camera, lighting, and integrates the car model with physics and controls.

### UI Components (in `components/ui/`)

| Component                        | Description                                     |
| -------------------------------- | ----------------------------------------------- |
| Visualization.jsx                | Main 3D viewport and overlay logic              |
| ControlPanel.jsx                 | Gear, mode, and engine controls                 |
| PedalControls.jsx                | Accelerator and brake sliders                   |
| CircularGauge.jsx                | Animated gauges for RPM, speed, temperature     |
| Telemetry.jsx                    | Real-time data display (speed, RPM, temp, etc.) |
| TelemetryChart.jsx               | Live-updating performance graphs                |
| StatPanel.jsx                    | Key stats summary                               |
| SoundSystem.jsx                  | Engine and environment audio feedback           |
| HelpModal.jsx                    | In-app help and documentation                   |
| button.jsx, slider.jsx, card.jsx | UI primitives                                   |

### Effects

- **ParticleSystem.jsx**: Visual effects (e.g., exhaust, sparks)

---

## 🗄️ Backend API & Data Model

> Implemented in [`app/api/[[...path]]/route.js`](app/api/[[...path]]/route.js)

### Endpoints

| Method | Endpoint           | Description                             |
| ------ | ------------------ | --------------------------------------- |
| GET    | /api/              | API info                                |
| POST   | /api/car-state     | Save car simulation state               |
| GET    | /api/car-state     | List car states (optionally by session) |
| GET    | /api/car-state/:id | Get specific car state                  |
| GET    | /api/metrics       | Aggregated performance metrics          |

### Data Model

```js
{
  id: "uuid",
  engineRunning: boolean,
  currentGear: string,
  speed: number,
  rpm: number,
  temperature: number,
  fuel: number,
  mileage: number,
  timestamp: Date,
  sessionId: "uuid"
}
```

### Features

- **MongoDB**: Flexible, session-based storage
- **CORS**: Universal API access
- **Error Handling**: Robust, with status codes and messages
- **Metrics**: Calculates averages, engine running %, and more

#### Example: Saving Car State

```bash
curl -X POST http://localhost:3000/api/car-state \
  -H 'Content-Type: application/json' \
  -d '{"engineRunning":true,"currentGear":"D","speed":120,"rpm":3500,"temperature":95,"fuel":60,"mileage":12345,"sessionId":"abc-123"}'
```

---

## 📊 Data Analytics & Metrics

- **Real-time Logging**: Every simulation tick can be logged
- **Session Analytics**: Multi-user, multi-session support
- **Performance Metrics**: Speed, RPM, temperature, fuel, mileage
- **Engine Running %**: Tracks usage and idling
- **Historical Trends**: Enables time-series and trend analysis

---

## 🛠️ Setup & Development

### Prerequisites

- Node.js (v18+ recommended)
- Yarn
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd digital-twin
   ```
2. **Install dependencies:**
   ```bash
   yarn install
   ```
3. **Configure environment variables:**
   - `MONGO_URL` — MongoDB connection string
   - `DB_NAME` — Database name
4. **Start the development server:**
   ```bash
   yarn dev
   ```
5. **Access the simulator:** [http://localhost:3000](http://localhost:3000)

---

## 🧩 Extensibility & Customization

- **Physics Engine**: Add new sensors, tweak gear/fuel/thermal models in `lib/carDynamics.js`
- **3D Models**: Replace or extend GLB models in `public/models/`
- **UI Components**: Add new panels, charts, or controls in `components/ui/`
- **API**: Add new endpoints or analytics in `app/api/[[...path]]/route.js`
- **Styling**: Customize with Tailwind, Radix, and your own CSS

---

## 🩺 Troubleshooting & Tips

- **MongoDB Connection**: Ensure your `MONGO_URL` and `DB_NAME` are correct and the DB is running
- **3D Model Issues**: Check GLB file paths and Three.js logs for errors
- **Performance**: Use browser dev tools and React Profiler for bottlenecks
- **API Errors**: See server logs for stack traces and error details
- **Hot Reload**: Next.js supports fast refresh for frontend changes

---

## 🌱 Future Enhancements

- Weather/environmental simulation
- Advanced fuel mapping and consumption models
- Additional engine sensors and diagnostics
- VR/AR integration for immersive experience
- Export and import of simulation datasets

---

## 👤 Credits & License

**Developed by Mohammed Arif.**
