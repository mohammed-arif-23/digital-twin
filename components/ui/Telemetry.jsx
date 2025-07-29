"use client"

import { useEffect, useState, useCallback } from 'react'
import { Activity, AlertTriangle, Gauge, Thermometer } from 'lucide-react'

export function Telemetry({
  engineRunning,
  speed,
  rpm,
  temperature,
  currentGear,
  carDynamics
}) {
  const [performance, setPerformance] = useState(null)
  const [mode, setMode] = useState('EFFICIENCY')

  const updatePerformance = useCallback(() => {
    if (!engineRunning) return;
    
    const analysis = carDynamics.analyzePerformance(speed, rpm, temperature, currentGear)
    if (analysis) {
      setPerformance(prev => {
        if (!prev) return analysis;
        
        const hasChanged = 
          prev.efficiency !== analysis.efficiency ||
          prev.currentMode !== analysis.currentMode ||
          prev.metrics.temperature !== analysis.metrics.temperature ||
          prev.metrics.rpm !== analysis.metrics.rpm ||
          prev.metrics.horsepower !== analysis.metrics.horsepower ||
          prev.metrics.gearEfficiency !== analysis.metrics.gearEfficiency ||
          prev.recommendations.length !== analysis.recommendations.length;
        
        return hasChanged ? analysis : prev;
      });
    }
  }, [engineRunning, speed, rpm, temperature, currentGear, carDynamics]);

  useEffect(() => {
    if (engineRunning) {
      updatePerformance();
      
      const interval = setInterval(updatePerformance, 100);
      return () => clearInterval(interval);
    } else {
      setPerformance(null);
    }
  }, [engineRunning, updatePerformance]);

  const toggleMode = useCallback(() => {
    const newMode = carDynamics.togglePerformanceMode();
    setMode(newMode);
  }, [carDynamics]);

  if (!engineRunning) return null;

  return (
    <div className="w-96 space-y-4">
      <div className="bg-black/40 backdrop-blur-md rounded-lg border border-blue-400/30 p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-400 text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              SYSTEM DIAGNOSTICS
            </h3>
            <button
              onClick={toggleMode}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                mode === 'POWER'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
              }`}
            >
              {mode} MODE
            </button>
          </div>

          {performance && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-400/20">
                  <div className="text-blue-300 text-xs mb-1">SYSTEM EFFICIENCY</div>
                  <div className="text-2xl font-medium tracking-wider" style={{ color: getEfficiencyColor(performance.efficiency) }}>
                    {performance.efficiency}%
                  </div>
                </div>
                <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-400/20">
                  <div className="text-purple-300 text-xs mb-1">OUTPUT</div>
                  <div className="text-2xl font-medium tracking-wider text-purple-400">
                    {Math.round(performance.metrics.horsepower)} HP
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {performance.recommendations.map((rec, index) => (
                  <div
                    key={`${rec.type}-${rec.severity}-${index}`}
                    className={`p-2 rounded-lg text-sm backdrop-blur-sm transition-all duration-300 ${
                      rec.severity === 'high'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                        : rec.severity === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{rec.message}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 bg-blue-900/10 rounded-lg p-2 border border-blue-400/20">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-200">RPM:</span>
                  <span className="text-white ml-auto">
                    {performance.metrics.rpm > carDynamics.performanceMetrics.optimalRpmRange[1]
                      ? 'CRITICAL'
                      : performance.metrics.rpm < carDynamics.performanceMetrics.optimalRpmRange[0]
                      ? 'LOW'
                      : 'OPTIMAL'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-orange-900/10 rounded-lg p-2 border border-orange-400/20">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-200">TEMP:</span>
                  <span className="text-white ml-auto">
                    {Math.round(performance.metrics.temperature)}°C
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getEfficiencyColor(efficiency) {
  if (efficiency >= 90) return '#4ade80'
  if (efficiency >= 75) return '#facc15'
  if (efficiency >= 50) return '#fb923c'
  return '#f87171'
}