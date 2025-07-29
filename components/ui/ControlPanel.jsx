'use client'

import { Button } from '@/components/ui/button'
import { Power, Save, RotateCcw, ChevronDown } from 'lucide-react'

export function ControlPanel({
  engineRunning,
  handleEngineToggle,
  currentGear,
  isShifting,
  gearOptions,
  handleGearChange,
  speed,
  saveCarState,
  handleReset,
}) {
  return (
    <div className="w-80 bg-black/40 backdrop-blur-md rounded-lg border border-blue-400/30 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />

      <div className="relative space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Power className={`w-5 h-5 ${engineRunning ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-sm font-medium ${engineRunning ? 'text-green-300' : 'text-red-300'}`}>
                ENGINE STATUS
              </span>
            </div>
            <Button
              onClick={handleEngineToggle}
              variant="outline"
              size="sm"
              className={`px-4 rounded-full transition-all duration-300 ${
                engineRunning
                  ? 'bg-green-500/20 text-green-400 border-green-400/30 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                  : 'bg-red-500/20 text-red-400 border-red-400/30 shadow-[0_0_15px_rgba(248,113,113,0.2)]'
              }`}
            >
              {engineRunning ? 'RUNNING' : 'OFF'}
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-300 text-sm font-medium">TRANSMISSION</span>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-mono">{currentGear}</span>
              <ChevronDown className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {gearOptions.map((gear) => (
              <Button
                key={gear}
                onClick={() => handleGearChange(gear)}
                disabled={isShifting || (speed > 5 && gear === 'R')}
                className={`transition-all duration-300 ${
                  currentGear === gear
                    ? 'bg-blue-600/40 text-blue-100 border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : 'bg-black/20 text-gray-300 border-blue-400/20 hover:bg-blue-900/20'
                } ${
                  isShifting ? 'animate-pulse' : ''
                }`}
                size="sm"
              >
                {gear}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={saveCarState}
            variant="outline"
            size="sm"
            className="bg-purple-500/20 text-purple-400 border-purple-400/30 hover:bg-purple-900/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
          >
            <Save className="w-4 h-4 mr-2" />
            SAVE
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="bg-orange-500/20 text-orange-400 border-orange-400/30 hover:bg-orange-900/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            RESET
          </Button>
        </div>
      </div>
    </div>
  )
}