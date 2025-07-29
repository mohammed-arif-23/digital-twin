'use client'

import { useEffect } from 'react'
import { GaugeCircle, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PedalControls({
  engineRunning,
  currentGear,
  onAcceleratorChange,
  onBrakeChange,
  acceleratorPosition,
  brakePosition
}) {
  if (!engineRunning || currentGear === 'P') return null;

  const handlePedalDown = () => onAcceleratorChange(100);
  const handlePedalUp = () => onAcceleratorChange(0);
  const handleBrakeDown = () => onBrakeChange(100);
  const handleBrakeUp = () => onBrakeChange(0);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.repeat) return;
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') handlePedalDown();
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') handleBrakeDown();
    }
    function handleKeyUp(e) {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') handlePedalUp();
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') handleBrakeUp();
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-80 bg-black/60 backdrop-blur-md rounded-xl border border-cyan-400/40 p-4 relative overflow-hidden shadow-lg">
      <div className="relative flex flex-col items-center gap-6">
        <div className="flex flex-row items-center gap-6 w-full justify-center">
          <button
            className={cn(
              'flex items-center gap-2 px-6 py-2 rounded-lg border-2 border-cyan-400 font-jarvis text-cyan-300 text-sm font-bold tracking-widest uppercase bg-transparent shadow-[0_0_12px_#00eaff55] hover:bg-cyan-400/10 hover:text-cyan-200 transition-all duration-150',
              acceleratorPosition === 100 && 'ring-2 ring-cyan-400')}
            onMouseDown={handlePedalDown}
            onMouseUp={handlePedalUp}
            onMouseLeave={handlePedalUp}
            onTouchStart={handlePedalDown}
            onTouchEnd={handlePedalUp}
            aria-pressed={acceleratorPosition === 100}
          >
            <GaugeCircle className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_8px_#00eaff]" />
            ACCELERATE
            <span className="ml-2 text-cyan-200 font-mono">{Math.round(acceleratorPosition)}%</span>
          </button>
          <div className="w-2 h-8 bg-cyan-400/30 rounded-full shadow-[0_0_8px_#00eaff] mx-2" />
          <button
            className={cn(
              'flex items-center gap-2 px-6 py-2 rounded-lg border-2 border-cyan-400 font-jarvis text-cyan-300 text-sm font-bold tracking-widest uppercase bg-transparent shadow-[0_0_12px_#00eaff55] hover:bg-cyan-400/10 hover:text-cyan-200 transition-all duration-150',
              brakePosition === 100 && 'ring-2 ring-cyan-400')}
            onMouseDown={handleBrakeDown}
            onMouseUp={handleBrakeUp}
            onMouseLeave={handleBrakeUp}
            onTouchStart={handleBrakeDown}
            onTouchEnd={handleBrakeUp}
            aria-pressed={brakePosition === 100}
          >
            <Square className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_8px_#00eaff]" />
            BRAKE
            <span className="ml-2 text-cyan-200 font-mono">{Math.round(brakePosition)}%</span>
          </button>
        </div>
      </div>
    </div>
  )
}
