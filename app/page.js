'use client'

import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Box, 
  Cylinder, 
  Sphere, 
  Text, 
  Environment,
  PerspectiveCamera,
  Html,
  useGLTF,
  ContactShadows,
  Float,
  MeshDistortMaterial,
  Sparkles,
  useAnimations
} from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Car, 
  Play, 
  Square, 
  Zap, 
  Gauge, 
  Settings,
  Cog,
  CircleDot,
  Activity,
  Thermometer,
  Fuel,
  Eye,
  Palette,
  Maximize,
  RotateCcw,
  TrendingUp,
  Database,
  Wifi
} from 'lucide-react'
import * as THREE from 'three'

// Advanced Car Body with premium materials and effects
function PremiumCarBody({ engineRunning, color = "#ff6b6b", selectedView }) {
  const meshRef = useRef()
  const engineHeatRef = useRef()
  
  useFrame((state) => {
    if (engineRunning && meshRef.current) {
      const time = state.clock.elapsedTime
      // Sophisticated engine vibration with multiple frequencies
      meshRef.current.position.y = 
        Math.sin(time * 8) * 0.015 + 
        Math.sin(time * 15) * 0.008 + 
        Math.sin(time * 25) * 0.003
      meshRef.current.rotation.z = Math.sin(time * 12) * 0.002
    }
    
    if (engineHeatRef.current && engineRunning) {
      engineHeatRef.current.material.emissiveIntensity = 
        0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }
  })

  return (
    <group ref={meshRef}>
      {/* Main car body with premium finish */}
      <Box args={[4.2, 1.6, 2.1]} position={[0, 0, 0]}>
        <meshPhysicalMaterial 
          color={color}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </Box>
      
      {/* Car roof with sunroof */}
      <Box args={[2.8, 1, 1.9]} position={[0, 1.3, 0]}>
        <meshPhysicalMaterial 
          color={color}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
        />
      </Box>
      
      {/* Sunroof glass */}
      <Box args={[2, 0.05, 1.5]} position={[0, 1.85, 0]}>
        <meshPhysicalMaterial 
          color="#87ceeb" 
          transparent 
          opacity={0.3}
          transmission={0.9}
          roughness={0}
          metalness={0}
        />
      </Box>
      
      {/* Premium windshields */}
      <Box args={[2.7, 0.9, 0.05]} position={[0.9, 1.25, 0.95]} rotation={[-0.2, 0, 0]}>
        <meshPhysicalMaterial 
          color="#87ceeb" 
          transparent 
          opacity={0.1}
          transmission={0.95}
          roughness={0}
        />
      </Box>
      <Box args={[2.7, 0.9, 0.05]} position={[0.9, 1.25, -0.95]} rotation={[0.2, 0, 0]}>
        <meshPhysicalMaterial 
          color="#87ceeb" 
          transparent 
          opacity={0.1}
          transmission={0.95}
          roughness={0}
        />
      </Box>
      
      {/* Advanced LED headlights */}
      <group position={[2.3, 0, 0]}>
        <Sphere args={[0.35]} position={[0, 0, 0.8]}>
          <meshPhysicalMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={engineRunning ? 1.2 : 0.2}
            metalness={0}
            roughness={0}
          />
        </Sphere>
        <Cylinder args={[0.15, 0.15, 0.1]} position={[0.1, 0, 0.8]} rotation={[0, 0, Math.PI / 2]}>
          <meshPhysicalMaterial 
            color="#4a90ff"
            emissive="#4a90ff"
            emissiveIntensity={engineRunning ? 0.8 : 0.1}
          />
        </Cylinder>
        
        <Sphere args={[0.35]} position={[0, 0, -0.8]}>
          <meshPhysicalMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={engineRunning ? 1.2 : 0.2}
            metalness={0}
            roughness={0}
          />
        </Sphere>
        <Cylinder args={[0.15, 0.15, 0.1]} position={[0.1, 0, -0.8]} rotation={[0, 0, Math.PI / 2]}>
          <meshPhysicalMaterial 
            color="#4a90ff"
            emissive="#4a90ff"
            emissiveIntensity={engineRunning ? 0.8 : 0.1}
          />
        </Cylinder>
      </group>
      
      {/* Advanced taillights */}
      <group position={[-2.3, 0, 0]}>
        <Sphere args={[0.25]} position={[0, 0, 0.8]}>
          <meshPhysicalMaterial 
            color="#ff2200"
            emissive="#ff2200"
            emissiveIntensity={engineRunning ? 0.8 : 0.2}
          />
        </Sphere>
        <Sphere args={[0.25]} position={[0, 0, -0.8]}>
          <meshPhysicalMaterial 
            color="#ff2200"
            emissive="#ff2200"
            emissiveIntensity={engineRunning ? 0.8 : 0.2}
          />
        </Sphere>
      </group>
      
      {/* Premium grille */}
      <Box args={[0.1, 0.8, 1.5]} position={[2.15, 0, 0]}>
        <meshPhysicalMaterial 
          color="#333333"
          metalness={1}
          roughness={0.2}
        />
      </Box>
      
      {/* Hood vents with heat effect */}
      <group ref={engineHeatRef}>
        {[...Array(6)].map((_, i) => (
          <Box key={i} args={[0.3, 0.02, 0.1]} position={[1.8, 0.85, -0.6 + i * 0.25]}>
            <meshPhysicalMaterial 
              color="#ff4400"
              emissive="#ff2200"
              emissiveIntensity={engineRunning ? 0.5 : 0}
            />
          </Box>
        ))}
      </group>
    </group>
  )
}

// Premium wheels with advanced materials
function PremiumWheel({ position, speed, engineRunning, wheelType = "sport" }) {
  const wheelRef = useRef()
  const rimRef = useRef()
  
  useFrame((state) => {
    if (wheelRef.current && engineRunning) {
      wheelRef.current.rotation.x += speed * 0.08
    }
    if (rimRef.current && engineRunning) {
      rimRef.current.rotation.x += speed * 0.08
    }
  })
  
  return (
    <group position={position}>
      {/* Premium tire */}
      <Cylinder ref={wheelRef} args={[0.65, 0.65, 0.35, 32]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhysicalMaterial 
          color="#1a1a1a"
          roughness={0.9}
          metalness={0}
        />
      </Cylinder>
      
      {/* Premium rim */}
      <Cylinder ref={rimRef} args={[0.45, 0.45, 0.37, 32]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhysicalMaterial 
          color="#c0c0c0"
          metalness={1}
          roughness={0.1}
          clearcoat={1}
        />
      </Cylinder>
      
      {/* Brake disc */}
      <Cylinder args={[0.35, 0.35, 0.05, 32]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhysicalMaterial 
          color="#666666"
          metalness={0.8}
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Brake caliper */}
      <Box args={[0.15, 0.3, 0.1]} position={[0, -0.3, 0.25]}>
        <meshPhysicalMaterial 
          color="#ff3333"
          metalness={0.2}
          roughness={0.4}
        />
      </Box>
    </group>
  )
}

// Advanced engine with heat effects and detailed components
function AdvancedEngine({ running, rpm, temperature = 85 }) {
  const engineRef = useRef()
  const pistonRefs = useRef([])
  
  useFrame((state) => {
    if (engineRef.current && running) {
      const time = state.clock.elapsedTime
      const intensity = rpm / 6000
      
      // Complex engine vibration
      engineRef.current.position.y = 
        Math.sin(time * 20 * intensity) * 0.03 * intensity +
        Math.sin(time * 35 * intensity) * 0.015 * intensity
      engineRef.current.rotation.z = Math.sin(time * 25 * intensity) * 0.01 * intensity
      
      // Piston animation
      pistonRefs.current.forEach((piston, i) => {
        if (piston) {
          piston.position.y = 0.7 + Math.sin(time * 30 + i * Math.PI / 3) * 0.1 * intensity
        }
      })
    }
  })
  
  return (
    <group ref={engineRef} position={[1.6, -0.25, 0]}>
      {/* Engine block */}
      <Box args={[1.4, 0.9, 1.6]}>
        <meshPhysicalMaterial 
          color={running ? "#ff4444" : "#555555"}
          emissive={running ? "#331111" : "#000000"}
          emissiveIntensity={running ? 0.3 : 0}
          metalness={0.8}
          roughness={0.3}
        />
      </Box>
      
      {/* Cylinders with pistons */}
      {[...Array(6)].map((_, i) => (
        <group key={i}>
          <Cylinder args={[0.18, 0.18, 0.8, 16]} 
                   position={[-0.4 + (i % 3) * 0.4, 0.8, i < 3 ? 0.4 : -0.4]}>
            <meshPhysicalMaterial color="#222222" metalness={0.9} roughness={0.2} />
          </Cylinder>
          
          <Cylinder 
            ref={el => pistonRefs.current[i] = el}
            args={[0.15, 0.15, 0.3, 16]} 
            position={[-0.4 + (i % 3) * 0.4, 0.7, i < 3 ? 0.4 : -0.4]}>
            <meshPhysicalMaterial color="#888888" metalness={0.7} roughness={0.3} />
          </Cylinder>
        </group>
      ))}
      
      {/* Exhaust manifold */}
      <Box args={[0.8, 0.3, 1.4]} position={[-0.9, 0, 0]}>
        <meshPhysicalMaterial 
          color="#ffaa00"
          emissive="#ff6600"
          emissiveIntensity={running ? 0.5 : 0}
          metalness={0.3}
          roughness={0.7}
        />
      </Box>
      
      {/* Turbocharger */}
      <Sphere args={[0.25]} position={[-1.2, 0.3, 0]}>
        <meshPhysicalMaterial 
          color="#silver"
          metalness={1}
          roughness={0.1}
        />
      </Sphere>
      
      {/* Heat shimmer effect when running */}
      {running && (
        <Sparkles 
          count={20}
          scale={[2, 1, 2]}
          size={2}
          speed={2}
          color="#ff6600"
          opacity={0.3}
        />
      )}
    </group>
  )
}

// Advanced gearbox with detailed mechanics
function AdvancedGearbox({ currentGear, isShifting, rpm }) {
  const gearRef = useRef()
  const shiftForkRef = useRef()
  
  useFrame((state) => {
    if (gearRef.current && isShifting) {
      gearRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 8) * 0.15
    }
    
    if (shiftForkRef.current) {
      const gearPositions = {'P': 0, 'R': -0.3, 'N': 0, 'D': 0.2, '1': 0.4, '2': 0.3, '3': 0.2, '4': 0.1, '5': 0}
      const targetPos = gearPositions[currentGear] || 0
      shiftForkRef.current.position.x += (targetPos - shiftForkRef.current.position.x) * 0.1
    }
  })
  
  return (
    <group ref={gearRef} position={[0, -0.75, 0]}>
      {/* Gearbox housing */}
      <Box args={[1.8, 0.7, 1.2]}>
        <meshPhysicalMaterial 
          color="#333333" 
          metalness={0.8} 
          roughness={0.3}
          clearcoat={0.5}
        />
      </Box>
      
      {/* Shift fork */}
      <Box ref={shiftForkRef} args={[0.1, 0.2, 0.8]} position={[0, 0.4, 0]}>
        <meshPhysicalMaterial color="#888888" metalness={0.9} roughness={0.1} />
      </Box>
      
      {/* Gear indicator with holographic effect */}
      <Html position={[0, 0.5, 0.7]} center>
        <div className={`px-4 py-2 rounded-lg text-2xl font-bold transition-all duration-300 ${
          isShifting ? 'bg-yellow-500/20 text-yellow-300 scale-110' : 'bg-blue-500/20 text-blue-300'
        } backdrop-blur-sm border border-white/20`}>
          {currentGear}
        </div>
      </Html>
      
      {/* Internal gears */}
      {[...Array(5)].map((_, i) => (
        <Cylinder key={i} args={[0.1, 0.1, 0.05, 16]} 
                 position={[-0.6 + i * 0.3, 0, 0]}
                 rotation={[Math.PI / 2, 0, 0]}>
          <meshPhysicalMaterial color="#666666" metalness={0.9} roughness={0.2} />
        </Cylinder>
      ))}
    </group>
  )
}

// Environmental effects and lighting
function SceneEnvironment({ engineRunning, timeOfDay = "day" }) {
  const { scene } = useThree()
  
  useEffect(() => {
    scene.fog = new THREE.Fog(0x000000, 10, 50)
  }, [scene])
  
  return (
    <>
      <Environment preset={timeOfDay === "day" ? "city" : "night"} />
      
      {/* Dynamic lighting based on engine state */}
      <ambientLight intensity={engineRunning ? 0.6 : 0.3} color="#ffffff" />
      <pointLight 
        position={[10, 10, 10]} 
        intensity={engineRunning ? 2 : 1} 
        color="#ffffff"
        castShadow
      />
      <pointLight 
        position={[-10, 5, -10]} 
        intensity={0.8} 
        color="#4a90ff"
      />
      
      {/* Spotlight for dramatic effect */}
      <spotLight
        position={[0, 15, 5]}
        angle={0.3}
        penumbra={0.5}
        intensity={1.5}
        castShadow
        target-position={[0, 0, 0]}
      />
      
      {/* Ground with reflections */}
      <ContactShadows 
        position={[0, -1.5, 0]}
        opacity={0.8}
        scale={20}
        blur={2}
        far={10}
        resolution={256}
        color="#000000"
      />
    </>
  )
}

// Advanced 3D Scene
function Premium3DScene({ 
  engineRunning, 
  currentGear, 
  speed, 
  rpm, 
  isShifting,
  carColor,
  temperature,
  selectedView
}) {
  return (
    <>
      <SceneEnvironment engineRunning={engineRunning} />
      
      <group position={[0, 1, 0]}>
        <PremiumCarBody 
          engineRunning={engineRunning} 
          color={carColor}
          selectedView={selectedView}
        />
        <AdvancedEngine running={engineRunning} rpm={rpm} temperature={temperature} />
        <AdvancedGearbox currentGear={currentGear} isShifting={isShifting} rpm={rpm} />
        
        {/* Premium wheels */}
        <PremiumWheel position={[1.6, -1, 1.3]} speed={speed} engineRunning={engineRunning} />
        <PremiumWheel position={[1.6, -1, -1.3]} speed={speed} engineRunning={engineRunning} />
        <PremiumWheel position={[-1.6, -1, 1.3]} speed={speed} engineRunning={engineRunning} />
        <PremiumWheel position={[-1.6, -1, -1.3]} speed={speed} engineRunning={engineRunning} />
      </group>
      
      {/* Floating particles for premium effect */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sparkles 
          count={50}
          scale={[15, 5, 15]}
          size={1}
          speed={0.5}
          color="#ffffff"
          opacity={0.1}
        />
      </Float>
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

// Main Premium Application
export default function PremiumDigitalTwinCar() {
  const [engineRunning, setEngineRunning] = useState(false)
  const [currentGear, setCurrentGear] = useState('P')
  const [speed, setSpeed] = useState(0)
  const [rpm, setRpm] = useState(800)
  const [isShifting, setIsShifting] = useState(false)
  const [carColor, setCarColor] = useState('#ff6b6b')
  const [temperature, setTemperature] = useState(85)
  const [selectedView, setSelectedView] = useState('exterior')
  const [isConnected, setIsConnected] = useState(true)
  const [sessionId] = useState(`session_${Date.now()}`)

  const gearOptions = ['P', 'R', 'N', 'D', '1', '2', '3', '4', '5']
  const premiumColors = [
    { name: 'Ferrari Red', value: '#ff2d00', gradient: 'from-red-500 to-red-700' },
    { name: 'Ocean Blue', value: '#0066cc', gradient: 'from-blue-500 to-blue-700' },
    { name: 'Electric Yellow', value: '#ffed00', gradient: 'from-yellow-400 to-yellow-600' },
    { name: 'Emerald Green', value: '#00cc66', gradient: 'from-green-500 to-green-700' },
    { name: 'Royal Purple', value: '#8b00ff', gradient: 'from-purple-500 to-purple-700' },
    { name: 'Carbon Black', value: '#1a1a1a', gradient: 'from-gray-800 to-black' },
    { name: 'Pearl White', value: '#f8f8ff', gradient: 'from-white to-gray-200' },
    { name: 'Rose Gold', value: '#e8b4b8', gradient: 'from-pink-300 to-rose-400' }
  ]

  const handleEngineToggle = () => {
    setEngineRunning(!engineRunning)
    if (!engineRunning) {
      setRpm(1000)
      setTemperature(85)
    } else {
      setRpm(0)
      setSpeed(0)
      setTemperature(20)
    }
  }

  const handleGearChange = (gear) => {
    if (!engineRunning && gear !== 'P') return
    
    setIsShifting(true)
    setCurrentGear(gear)
    
    setTimeout(() => setIsShifting(false), 800)
    
    // Advanced RPM calculation
    const baseRpm = engineRunning ? 1000 : 0
    const gearMultipliers = {'P': 0, 'R': 1.8, 'N': 0, 'D': 1.5, '1': 3, '2': 2.5, '3': 2, '4': 1.5, '5': 1.2}
    const multiplier = gearMultipliers[gear] || 1
    setRpm(baseRpm + (speed * 25 * multiplier))
  }

  const handleSpeedChange = (newSpeed) => {
    if (!engineRunning || currentGear === 'P' || currentGear === 'N') return
    
    setSpeed(newSpeed[0])
    
    // Advanced temperature simulation
    const tempIncrease = newSpeed[0] * 0.5
    setTemperature(85 + tempIncrease)
    
    // Calculate RPM based on gear and speed
    const baseRpm = 1000
    const gearMultipliers = {'R': 50, 'D': 30, '1': 80, '2': 60, '3': 45, '4': 35, '5': 25}
    const multiplier = gearMultipliers[currentGear] || 30
    setRpm(baseRpm + (newSpeed[0] * multiplier))
  }

  const saveCarState = async () => {
    try {
      await fetch('/api/car-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineRunning,
          currentGear,
          speed,
          rpm,
          carColor,
          temperature,
          sessionId
        })
      })
    } catch (error) {
      console.error('Failed to save car state:', error)
    }
  }

  // Auto-save every 10 seconds when engine is running
  useEffect(() => {
    if (engineRunning) {
      const interval = setInterval(saveCarState, 10000)
      return () => clearInterval(interval)
    }
  }, [engineRunning, currentGear, speed, rpm, carColor, temperature])

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1644749700856-a82a92828a1b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxjYXIlMjBzaG93cm9vbXxlbnwwfHx8fDE3NTMyNzE3OTF8MA&ixlib=rb-4.1.0&q=85')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      
      <div className="relative z-10 container mx-auto p-4">
        {/* Premium Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-4">
            <div className="relative">
              <Car className="w-12 h-12 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white mb-1">Digital Twin</h1>
              <p className="text-blue-300 text-lg">Premium Vehicle Simulation</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Wifi className={`w-5 h-5 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
              <span className="text-sm text-gray-300">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 3D Visualization - Takes up more space */}
          <div className="xl:col-span-3">
            <Card className="h-[700px] bg-black/20 backdrop-blur-md border border-white/10 overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="relative">
                      <CircleDot className="w-6 h-6 text-green-400" />
                      <div className="absolute inset-0 animate-ping">
                        <CircleDot className="w-6 h-6 text-green-400 opacity-20" />
                      </div>
                    </div>
                    Premium 3D Visualization Engine
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-green-400 text-green-400">
                      <Activity className="w-3 h-3 mr-1" />
                      Live Simulation
                    </Badge>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">
                      60 FPS
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[620px] p-0 relative">
                <div className="w-full h-full">
                  <Canvas 
                    camera={{ position: [6, 4, 6], fov: 50 }}
                    shadows="soft"
                    gl={{ 
                      antialias: true, 
                      alpha: true,
                      powerPreference: "high-performance"
                    }}
                  >
                    <Premium3DScene 
                      engineRunning={engineRunning}
                      currentGear={currentGear}
                      speed={speed}
                      rpm={rpm}
                      isShifting={isShifting}
                      carColor={carColor}
                      temperature={temperature}
                      selectedView={selectedView}
                    />
                  </Canvas>
                </div>
                
                {/* Floating performance metrics */}
                <div className="absolute top-4 left-4 space-y-2">
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                    <div className="text-xs text-gray-300">Render Time</div>
                    <div className="text-lg font-bold text-green-400">16.67ms</div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                    <div className="text-xs text-gray-300">Memory</div>
                    <div className="text-lg font-bold text-blue-400">124MB</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel - Refined sidebar */}
          <div className="xl:col-span-1 space-y-4">
            {/* Engine Control */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cog className={`w-5 h-5 ${engineRunning ? 'text-red-400 animate-spin' : 'text-gray-400'}`} />
                  Engine Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleEngineToggle}
                  size="lg"
                  className={`w-full transition-all duration-300 ${
                    engineRunning 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/25' 
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/25'
                  }`}
                >
                  {engineRunning ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Engine
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Engine
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-black/20 rounded-lg border border-white/10">
                    <Thermometer className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                    <div className="text-xs text-gray-300">Temp</div>
                    <div className={`text-sm font-bold ${
                      temperature > 100 ? 'text-red-400' : 
                      temperature > 90 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {Math.round(temperature)}°C
                    </div>
                  </div>
                  <div className="text-center p-2 bg-black/20 rounded-lg border border-white/10">
                    <Fuel className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                    <div className="text-xs text-gray-300">Fuel</div>
                    <div className="text-sm font-bold text-blue-400">78%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gear Control */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Transmission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  {gearOptions.map((gear) => (
                    <Button
                      key={gear}
                      onClick={() => handleGearChange(gear)}
                      variant="outline"
                      className={`h-10 transition-all duration-200 ${
                        currentGear === gear 
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-400 text-white shadow-lg shadow-purple-500/25' 
                          : 'bg-black/20 hover:bg-black/40 text-gray-300 border-white/20'
                      } ${isShifting && currentGear === gear ? 'animate-pulse' : ''}`}
                      disabled={!engineRunning && gear !== 'P'}
                    >
                      {gear}
                    </Button>
                  ))}
                </div>
                
                <div className="text-center p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-400/30">
                  <div className="text-xs text-gray-300 mb-1">Current Gear</div>
                  <div className={`text-3xl font-bold ${
                    isShifting ? 'text-yellow-400 animate-pulse' : 'text-purple-400'
                  }`}>
                    {currentGear}
                  </div>
                  {isShifting && (
                    <div className="text-xs text-yellow-400 mt-1 animate-pulse">
                      SHIFTING...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Speed & Performance */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-cyan-400" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white text-sm">Speed</label>
                    <span className="text-cyan-400 font-bold">{speed} mph</span>
                  </div>
                  <Slider
                    value={[speed]}
                    onValueChange={handleSpeedChange}
                    max={120}
                    step={5}
                    className="w-full"
                    disabled={!engineRunning || currentGear === 'P' || currentGear === 'N'}
                  />
                  <Progress value={(speed / 120) * 100} className="h-2 mt-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-lg border border-cyan-400/30">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                    <div className="text-xs text-gray-300">RPM</div>
                    <div className={`text-sm font-bold ${
                      rpm > 5000 ? 'text-red-400' : 
                      rpm > 3000 ? 'text-yellow-400' : 'text-cyan-400'
                    }`}>
                      {rpm.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gradient-to-r from-green-600/20 to-cyan-600/20 rounded-lg border border-green-400/30">
                    <Activity className="w-4 h-4 mx-auto mb-1 text-green-400" />
                    <div className="text-xs text-gray-300">Power</div>
                    <div className="text-sm font-bold text-green-400">
                      {Math.round((rpm * speed) / 100)} HP
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Customization */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-400" />
                  Customization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {premiumColors.map((color) => (
                    <Button
                      key={color.value}
                      onClick={() => setCarColor(color.value)}
                      variant="outline"
                      className={`h-12 relative overflow-hidden transition-all duration-300 ${
                        carColor === color.value 
                          ? 'border-white border-2 shadow-lg' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div 
                        className={`absolute inset-0 bg-gradient-to-r ${color.gradient} opacity-80`}
                      />
                      <span className="relative text-white font-medium text-xs drop-shadow-lg">
                        {color.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Premium Status Dashboard */}
        <div className="mt-6">
          <Card className="bg-black/20 backdrop-blur-md border border-white/10">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <Badge 
                    variant={engineRunning ? "default" : "secondary"}
                    className={`${
                      engineRunning 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    } px-3 py-1`}
                  >
                    <Activity className="w-3 h-3 mr-1" />
                    Engine: {engineRunning ? "RUNNING" : "STOPPED"}
                  </Badge>
                  
                  <Badge variant="outline" className="border-purple-400 text-purple-400 px-3 py-1">
                    <Settings className="w-3 h-3 mr-1" />
                    Gear: {currentGear}
                  </Badge>
                  
                  <Badge variant="outline" className="border-cyan-400 text-cyan-400 px-3 py-1">
                    <Gauge className="w-3 h-3 mr-1" />
                    {speed} mph
                  </Badge>
                  
                  <Badge variant="outline" className="border-yellow-400 text-yellow-400 px-3 py-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {rpm.toLocaleString()} RPM
                  </Badge>
                  
                  <Badge variant="outline" className="border-pink-400 text-pink-400 px-3 py-1">
                    <Database className="w-3 h-3 mr-1" />
                    Session: {sessionId.slice(-6)}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Premium Digital Twin v2.0 | Real-time Physics Engine
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}