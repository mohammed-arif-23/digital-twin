'use client'

import { Canvas } from '@react-three/fiber'
import { Button } from '@/components/ui/button'
import { CircleDot, Activity } from 'lucide-react'
import { CarScene } from '@/components/car/CarScene'

export function Visualization({ 
  engineRunning, 
  currentGear, 
  speed, 
  rpm, 
  isShifting, 
  temperature, 
  engineLoad,
  viewMode, 
  setViewMode, 
  viewOptions, 
  useCustomModel, 
  modelPath,
  brakePosition = 0
}) {
  const eventSource = typeof window !== 'undefined' ? document.documentElement : undefined;
  
  const handleViewChange = (newViewMode) => {
    console.log('View mode changing from', viewMode, 'to', newViewMode);
    setViewMode(newViewMode);
  };
  
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        inset: 0,
        touchAction: 'none',
        cursor: 'default',
        background: 'radial-gradient(circle at center, #000B1A 0%, #000000 100%)'
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] opacity-20">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border border-blue-500/10" />
          ))}
        </div>
        
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-blue-400/50" />
        <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-blue-400/50" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-blue-400/50" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-blue-400/50" />
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30 pointer-events-auto">
        <CircleDot className="w-4 h-4 text-blue-400" />
        <div className="flex gap-1">
          {viewOptions.map((view) => {
            const IconComponent = view.icon
            return (
              <Button
                key={view.key}
                onClick={() => handleViewChange(view.key)}
                variant="outline"
                size="sm"
                className={`h-8 px-3 rounded-full transition-all duration-300 ${
                  viewMode === view.key 
                    ? 'bg-blue-600/40 border-blue-400/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                    : 'bg-black/40 text-gray-300 border-white/20 hover:bg-blue-900/20'
                }`}
              >
                <IconComponent className="w-3 h-3 mr-2" />
                {view.label}
              </Button>
            )
          })}
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-green-400/30 text-green-400 text-xs bg-green-900/20">
          <Activity className="w-3 h-3" />
          Live
        </div>
      </div>

      <Canvas 
        camera={{ position: [6, 4, 6], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        raycaster={{ computeOffsets: ({ clientX, clientY }) => ({ offsetX: clientX, offsetY: clientY }) }}
        style={{ 
          position: 'absolute',
          inset: 0,
          touchAction: 'none',
          cursor: 'default',
          background: 'radial-gradient(circle at center, #000B1A 0%, #000000 100%)'
        }}
        eventSource={eventSource}
        eventPrefix="client"
        onCreated={({ gl }) => {
          gl.domElement.style.display = 'block';
          gl.domElement.style.touchAction = 'none';
        }}
      >
        <CarScene
          engineRunning={engineRunning}
          speed={speed}
          rpm={rpm}
          isShifting={isShifting}
          temperature={temperature}
          engineLoad={engineLoad}
          currentGear={currentGear}
          viewMode={viewMode}
          useCustomModel={useCustomModel}
          modelPath={modelPath}
          brakePosition={brakePosition}
        />
      </Canvas>
    </div>
  )
}