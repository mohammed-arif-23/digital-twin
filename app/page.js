'use client'

import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Box, Cylinder, Sphere, Text } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Car, 
  Play, 
  Square, 
  Zap, 
  Gauge, 
  Settings,
  Cog,
  CircleDot 
} from 'lucide-react'

// Car Body Component
function CarBody({ engineRunning, color = "#ff6b6b" }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (engineRunning && meshRef.current) {
      // Engine vibration effect
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.02
    }
  })

  return (
    <group ref={meshRef}>
      {/* Main car body */}
      <Box args={[4, 1.5, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      
      {/* Car roof */}
      <Box args={[2.5, 1, 1.8]} position={[0, 1.25, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      
      {/* Windshield */}
      <Box args={[2.6, 0.8, 0.1]} position={[0.8, 1.2, 0.9]}>
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
      </Box>
      <Box args={[2.6, 0.8, 0.1]} position={[0.8, 1.2, -0.9]}>
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
      </Box>
      
      {/* Headlights */}
      <Sphere args={[0.3]} position={[2.2, 0, 0.7]}>
        <meshStandardMaterial color="#ffffcc" emissive="#ffffcc" emissiveIntensity={engineRunning ? 0.5 : 0.1} />
      </Sphere>
      <Sphere args={[0.3]} position={[2.2, 0, -0.7]}>
        <meshStandardMaterial color="#ffffcc" emissive="#ffffcc" emissiveIntensity={engineRunning ? 0.5 : 0.1} />
      </Sphere>
      
      {/* Taillights */}
      <Sphere args={[0.2]} position={[-2.2, 0, 0.7]}>
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={engineRunning ? 0.3 : 0.1} />
      </Sphere>
      <Sphere args={[0.2]} position={[-2.2, 0, -0.7]}>
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={engineRunning ? 0.3 : 0.1} />
      </Sphere>
    </group>
  )
}

// Wheel Component with rotation
function Wheel({ position, speed, engineRunning }) {
  const wheelRef = useRef()
  
  useFrame(() => {
    if (wheelRef.current && engineRunning) {
      wheelRef.current.rotation.x += speed * 0.1
    }
  })
  
  return (
    <group position={position}>
      {/* Tire */}
      <Cylinder ref={wheelRef} args={[0.6, 0.6, 0.3, 16]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      {/* Rim */}
      <Cylinder args={[0.4, 0.4, 0.35, 16]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </Cylinder>
    </group>
  )
}

// Engine Component
function EngineComponent({ running, rpm }) {
  const engineRef = useRef()
  
  useFrame((state) => {
    if (engineRef.current && running) {
      const intensity = rpm / 6000
      engineRef.current.position.y = Math.sin(state.clock.elapsedTime * 15) * 0.05 * intensity
      engineRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 20) * 0.02 * intensity
    }
  })
  
  return (
    <group ref={engineRef} position={[1.5, -0.3, 0]}>
      {/* Engine block */}
      <Box args={[1.2, 0.8, 1.5]}>
        <meshStandardMaterial 
          color={running ? "#ff6666" : "#666666"} 
          emissive={running ? "#441111" : "#000000"}
          emissiveIntensity={running ? 0.2 : 0}
        />
      </Box>
      
      {/* Engine cylinders */}
      <Cylinder args={[0.15, 0.15, 0.6, 8]} position={[-0.3, 0.7, 0.3]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.6, 8]} position={[0, 0.7, 0.3]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.6, 8]} position={[0.3, 0.7, 0.3]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.6, 8]} position={[-0.3, 0.7, -0.3]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.6, 8]} position={[0, 0.7, -0.3]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.6, 8]} position={[0.3, 0.7, -0.3]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
    </group>
  )
}

// Gearbox visualization
function Gearbox({ currentGear, isShifting }) {
  const gearRef = useRef()
  
  useFrame((state) => {
    if (gearRef.current && isShifting) {
      gearRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 5) * 0.1
    }
  })
  
  return (
    <group ref={gearRef} position={[0, -0.8, 0]}>
      {/* Gearbox housing */}
      <Box args={[1.5, 0.6, 1]}>
        <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.4} />
      </Box>
      
      {/* Gear indicator */}
      <Text
        position={[0, 0.4, 0.6]}
        fontSize={0.3}
        font="/fonts/Inter-Bold.ttf"
        color={isShifting ? "#ffaa00" : "#ffffff"}
      >
        {currentGear}
      </Text>
    </group>
  )
}

// Main 3D Scene
function Car3DScene({ 
  engineRunning, 
  currentGear, 
  speed, 
  rpm, 
  isShifting,
  carColor 
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={0.8} castShadow />
      
      <group position={[0, 1, 0]}>
        <CarBody engineRunning={engineRunning} color={carColor} />
        <EngineComponent running={engineRunning} rpm={rpm} />
        <Gearbox currentGear={currentGear} isShifting={isShifting} />
        
        {/* Wheels */}
        <Wheel position={[1.5, -1, 1.2]} speed={speed} engineRunning={engineRunning} />
        <Wheel position={[1.5, -1, -1.2]} speed={speed} engineRunning={engineRunning} />
        <Wheel position={[-1.5, -1, 1.2]} speed={speed} engineRunning={engineRunning} />
        <Wheel position={[-1.5, -1, -1.2]} speed={speed} engineRunning={engineRunning} />
      </group>
      
      {/* Ground plane */}
      <Box args={[20, 0.1, 20]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#666666" />
      </Box>
      
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  )
}

// Main Application Component
export default function App() {
  const [engineRunning, setEngineRunning] = useState(false)
  const [currentGear, setCurrentGear] = useState('P')
  const [speed, setSpeed] = useState(0)
  const [rpm, setRpm] = useState(800)
  const [isShifting, setIsShifting] = useState(false)
  const [carColor, setCarColor] = useState('#ff6b6b')

  const gearOptions = ['P', 'R', 'N', 'D', '1', '2', '3', '4', '5']
  const colorOptions = [
    { name: 'Red', value: '#ff6b6b' },
    { name: 'Blue', value: '#4ecdc4' },
    { name: 'Yellow', value: '#ffe66d' },
    { name: 'Green', value: '#95e1d3' },
    { name: 'Purple', value: '#a8e6cf' },
    { name: 'Orange', value: '#ffaaa5' }
  ]

  const handleEngineToggle = () => {
    setEngineRunning(!engineRunning)
    if (!engineRunning) {
      setRpm(1000)
    } else {
      setRpm(0)
      setSpeed(0)
    }
  }

  const handleGearChange = (gear) => {
    if (!engineRunning && gear !== 'P') return
    
    setIsShifting(true)
    setCurrentGear(gear)
    
    // Reset shifting animation after 500ms
    setTimeout(() => setIsShifting(false), 500)
    
    // Adjust RPM based on gear
    if (gear === 'P' || gear === 'N') {
      setRpm(engineRunning ? 1000 : 0)
    } else if (gear === 'R') {
      setRpm(engineRunning ? 1500 : 0)
    } else {
      setRpm(engineRunning ? 2000 : 0)
    }
  }

  const handleSpeedChange = (newSpeed) => {
    if (!engineRunning || currentGear === 'P' || currentGear === 'N') return
    
    setSpeed(newSpeed[0])
    // Calculate RPM based on speed and gear
    const baseRpm = 800
    const speedMultiplier = currentGear === 'R' ? 50 : 30
    setRpm(baseRpm + (newSpeed[0] * speedMultiplier))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Car className="w-10 h-10 text-blue-400" />
            Digital Twin Car
          </h1>
          <p className="text-gray-300 text-lg">Interactive 3D Vehicle Simulation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Visualization */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] bg-black/20 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <CircleDot className="w-5 h-5 text-green-400" />
                  3D Car Visualization
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[500px] p-2">
                <div className="w-full h-full rounded-lg overflow-hidden">
                  <Canvas 
                    camera={{ position: [5, 3, 5], fov: 60 }}
                    shadows
                  >
                    <Car3DScene 
                      engineRunning={engineRunning}
                      currentGear={currentGear}
                      speed={speed}
                      rpm={rpm}
                      isShifting={isShifting}
                      carColor={carColor}
                    />
                  </Canvas>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Engine Controls */}
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Engine className="w-5 h-5 text-red-400" />
                  Engine Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleEngineToggle}
                  size="lg"
                  className={`w-full ${
                    engineRunning 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
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
                
                <div className="text-center">
                  <Badge variant={engineRunning ? "default" : "secondary"}>
                    {engineRunning ? "RUNNING" : "STOPPED"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Gear Control */}
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  Gear Selector
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {gearOptions.map((gear) => (
                    <Button
                      key={gear}
                      onClick={() => handleGearChange(gear)}
                      variant={currentGear === gear ? "default" : "outline"}
                      className={`h-12 ${
                        currentGear === gear 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                      }`}
                      disabled={!engineRunning && gear !== 'P'}
                    >
                      {gear}
                    </Button>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <div className="text-white text-sm">Current Gear</div>
                  <div className={`text-2xl font-bold ${isShifting ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {currentGear}
                  </div>
                  {isShifting && (
                    <Badge variant="outline" className="mt-1 border-yellow-400 text-yellow-400">
                      SHIFTING
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Speed Control */}
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-green-400" />
                  Speed Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">
                    Speed: {speed} mph
                  </label>
                  <Slider
                    value={[speed]}
                    onValueChange={handleSpeedChange}
                    max={120}
                    step={5}
                    className="w-full"
                    disabled={!engineRunning || currentGear === 'P' || currentGear === 'N'}
                  />
                </div>
                
                <Separator className="bg-gray-600" />
                
                <div className="text-center">
                  <div className="text-white text-sm">RPM</div>
                  <div className={`text-xl font-bold ${
                    rpm > 4000 ? 'text-red-400' : 
                    rpm > 2000 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {rpm.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Car Color */}
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Car Color
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {colorOptions.map((color) => (
                    <Button
                      key={color.value}
                      onClick={() => setCarColor(color.value)}
                      variant="outline"
                      className={`h-10 border-2 ${
                        carColor === color.value 
                          ? 'border-white' 
                          : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      <span className="text-white font-medium drop-shadow-lg">
                        {color.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6">
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="py-4">
              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                  <Badge variant={engineRunning ? "default" : "secondary"}>
                    Engine: {engineRunning ? "ON" : "OFF"}
                  </Badge>
                  <Badge variant="outline" className="border-blue-400 text-blue-400">
                    Gear: {currentGear}
                  </Badge>
                  <Badge variant="outline" className="border-green-400 text-green-400">
                    Speed: {speed} mph
                  </Badge>
                  <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                    RPM: {rpm.toLocaleString()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400">
                  Digital Twin v1.0 | Real-time 3D Simulation
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}