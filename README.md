# V8 Engine Digital Twin Simulator

## Project Overview

An advanced real-time digital twin simulation of a V8 engine, featuring dynamic performance analysis, real-time visualization, and interactive controls. The project demonstrates the integration of 3D visualization, real-time physics calculations, and performance optimization systems.

## Key Features

### 1. Engine Specifications

- **Engine Type**: V8
- **Power Output**: Up to 700hp
- **Maximum RPM**: 8400
- **Torque**: 850 Nm
- **Displacement**: 8 pistons, 2 strokes
- **Fuel System**: 68-85L tank capacity with 400-850 km range

### 2. Real-time Performance Analysis

- **Efficiency Monitoring**

  - Dynamic efficiency scoring (0-100%)
  - Real-time power output tracking
  - Gear efficiency calculations
  - Temperature monitoring and optimization

- **Adaptive Tuning**
  - Two performance modes: EFFICIENCY and POWER
  - Real-time recommendations for optimal performance
  - Dynamic RPM range optimization
  - Intelligent gear selection guidance

### 3. Advanced Visualization

- **3D Model Features**

  - Interactive transparent body for internal component viewing
  - Temperature-based color changes for engine components
  - Dynamic brake light system with realistic effects
  - Real-time wheel rotation physics

- **Component Visualization**
  - Engine parts with temperature-based color changes
  - Interactive tooltips for component information
  - Real-time status indicators
  - Dynamic lighting effects

### 4. Dynamic Systems

#### Temperature Management

- Operating range: 85-110°C
- Color-coded temperature visualization
- Real-time thermal feedback
- Cooling system simulation

#### Brake System

- Response time: 0.1-0.3 seconds
- Full release time: 10-20 seconds
- Dynamic brake light effects
  - Consistent red coloring
  - Smooth intensity transitions
  - Realistic light behavior

#### Performance Metrics

- **Speed Ranges**

  ```
  0-100 hp:  140-180 km/h
  100-200 hp: 180-230 km/h
  200-300 hp: 230-260 km/h
  300-400 hp: 260-290 km/h
  400-500 hp: 290-310 km/h
  500-600 hp: 310-325 km/h
  600-700 hp: 325-350+ km/h
  ```

- **Wheel RPM Mapping**
  ```
  0-10 km/h:   76 RPM
  10-20 km/h:  152 RPM
  20-30 km/h:  227 RPM
  ...
  90-100 km/h: 758 RPM
  ```

## Technical Implementation

### Core Technologies

- Next.js for the application framework
- Three.js for 3D visualization
- React Three Fiber for 3D rendering in React
- Custom physics engine for real-time calculations

### Key Components

#### CarDynamics Class

- Engine performance calculations
- Real-time efficiency analysis
- Temperature management
- Fuel consumption modeling

#### Visualization System

- Real-time 3D rendering
- Dynamic material updates
- Interactive component highlighting
- Performance mode visualization

#### Performance Monitoring

- Real-time data collection
- Dynamic recommendation system
- Efficiency scoring
- Performance mode switching

## Recent Implementations

### 1. Advanced Brake Light System

- Physically accurate light behavior
- Smooth state transitions
- Realistic material properties
- Dynamic intensity control

### 2. Performance Analysis System

- Real-time efficiency scoring
- Dynamic recommendations
- Mode-specific optimizations
- Comprehensive metrics tracking

### 3. Temperature Visualization

- Component-specific color changes
- Real-time temperature feedback
- Thermal warning system
- Mode-dependent thresholds

## Creating Presentation Cards

### Suggested Card Structure for gamma.ai

1. **Project Overview Card**

   - Title: V8 Engine Digital Twin
   - Key capabilities
   - Visual: 3D engine model

2. **Engine Specifications Card**

   - Technical specifications
   - Performance ranges
   - Visual: Specifications diagram

3. **Real-time Analysis Card**

   - Performance monitoring
   - Efficiency scoring
   - Visual: Dashboard screenshot

4. **Visualization Features Card**

   - 3D model features
   - Component interaction
   - Visual: Interactive components demo

5. **Dynamic Systems Card**

   - Temperature management
   - Brake system
   - Visual: Systems diagram

6. **Performance Metrics Card**

   - Speed ranges
   - Power output
   - Visual: Performance graphs

7. **Technical Implementation Card**

   - Core technologies
   - Architecture
   - Visual: System architecture diagram

8. **Recent Features Card**
   - Brake light system
   - Performance analysis
   - Visual: Feature demonstrations

## Future Enhancements

- Weather condition impacts
- Advanced fuel mapping
- Extended sensor simulation
- VR/AR integration capabilities

## Getting Started

1. Clone the repository
2. Install dependencies: `yarn install`
3. Run the development server: `yarn dev`
4. Access the simulator at `localhost:3000`
"# digital-twin-car" 
