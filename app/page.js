"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Car, Cog } from "lucide-react";
import { CarDynamics } from "@/lib/carDynamics";
import { Visualization } from "@/components/ui/Visualization";
import { HelpModal } from "@/components/ui/HelpModal";
import { SoundSystem } from "@/components/ui/SoundSystem";

export default function DigitalTwinCar() {
  const [engineRunning, setEngineRunning] = useState(false);
  const [currentGear, setCurrentGear] = useState("P");
  const [vehicleSpeed, setVehicleSpeed] = useState(0);
  const [engineRpm, setEngineRpm] = useState(800);
  const [engineTemperature, setEngineTemperature] = useState(85);
  const [fuelLevel, setFuelLevel] = useState(60);
  const [fuelEconomy, setFuelEconomy] = useState(0);
  const [isShifting, setIsShifting] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [engineLoad, setEngineLoad] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [viewMode, setViewMode] = useState("track");
  const [modelPath] = useState(null);
  const [acceleratorPosition, setAcceleratorPosition] = useState(0);
  const [brakePosition, setBrakePosition] = useState(0);
  const [currentHorsepower, setCurrentHorsepower] = useState(0);
  const [shiftError, setShiftError] = useState(false);

  const vehicleDynamics = useRef(new CarDynamics()).current;
  const lastUpdateTime = useRef(Date.now());

  const availableGears = ["P", "R", "N", "D", "1", "2", "3", "4", "5"];
  const cameraViews = [
    { key: "track", label: "Track", icon: Car },
    { key: "engine", label: "Engine", icon: Cog },
  ];

  useEffect(() => { setSessionId(`session_${Date.now()}`); }, []);

  // ── Physics loop ────────────────────────────────────────────────
  useEffect(() => {
    if (!engineRunning) {
      setEngineRpm(0);
      setCurrentHorsepower(0);
      return;
    }
    const updateInterval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = now;

      vehicleDynamics.setAcceleratorPedal(acceleratorPosition);
      vehicleDynamics.setBrakePedal(brakePosition);

      const newSpeed = vehicleDynamics.calculateTargetSpeed(vehicleSpeed, currentGear, dt);
      setVehicleSpeed(newSpeed);

      const newRpm = vehicleDynamics.calculateRPM(newSpeed, currentGear, engineRunning);
      setEngineRpm(newRpm);

      const hp = vehicleDynamics.calculateCurrentHorsepower(newRpm, acceleratorPosition / 100);
      setCurrentHorsepower(hp);

      setEngineTemperature((prev) =>
        vehicleDynamics.calculateTemperature(newSpeed, newRpm, prev, dt, engineRunning)
      );

      const fuelRate = vehicleDynamics.calculateFuelConsumption(newSpeed, newRpm, currentGear, dt);
      setFuelLevel((prev) => Math.max(0, prev - fuelRate));
      setFuelEconomy(vehicleDynamics.calculateMileage(newSpeed, fuelRate));
      setEngineLoad(vehicleDynamics.calculateEngineLoad(newSpeed, newRpm));
    }, 50);
    return () => clearInterval(updateInterval);
  }, [engineRunning, vehicleSpeed, currentGear, acceleratorPosition, brakePosition, vehicleDynamics, engineTemperature]);

  const toggleEngine = useCallback(() => {
    setEngineRunning((prev) => {
      if (!prev) { setEngineRpm(800); setEngineTemperature(85); }
      else { setEngineRpm(0); setVehicleSpeed(0); setEngineTemperature(20); setCurrentGear("P"); }
      return !prev;
    });
  }, []);

  const changeGear = useCallback((gear) => {
    if (!engineRunning && gear !== "P") return;

    // Enforce sequential shifting for numeric gears (1-5)
    const numericGears = ["1", "2", "3", "4", "5"];
    const currentIdx = numericGears.indexOf(currentGear);
    const targetIdx = numericGears.indexOf(gear);

    if (currentIdx !== -1 && targetIdx !== -1) {
      if (Math.abs(targetIdx - currentIdx) > 1) {
        setShiftError(true);
        setTimeout(() => setShiftError(false), 1500);
        return;
      }
    }

    setIsShifting(true);
    setCurrentGear(gear);
    setTimeout(() => setIsShifting(false), 500);
  }, [engineRunning, currentGear]);

  const resetVehicle = useCallback(() => {
    setEngineRunning(false); setCurrentGear("P"); setVehicleSpeed(0);
    setEngineRpm(0); setEngineTemperature(85); setFuelLevel(75);
    setFuelEconomy(0); setEngineLoad(0); setIsShifting(false);
    setAcceleratorPosition(0); setBrakePosition(0); setCurrentHorsepower(0);
  }, []);

  // ── Keyboard controls ───────────────────────────────────────────
  useEffect(() => {
    const down = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch (e.key.toLowerCase()) {
        case "e": toggleEngine(); break;
        case "r": resetVehicle(); break;
        case "1": case "2": case "3": case "4": case "5":
          if (engineRunning) changeGear(e.key); break;
        case "d": if (engineRunning) changeGear("D"); break;
        case "p": changeGear("P"); break;
        case "n": if (engineRunning) changeGear("N"); break;
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [engineRunning, currentGear, toggleEngine, changeGear, resetVehicle]);

  useEffect(() => {
    const kd = (e) => {
      if (e.repeat) return;
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") setAcceleratorPosition(100);
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") setBrakePosition(100);
    };
    const ku = (e) => {
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") setAcceleratorPosition(0);
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") setBrakePosition(0);
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  // vehicleSpeed is in m/s (physics model) → convert to km/h for display
  const speedKmh = Math.round(vehicleSpeed * 3.6);

  // ── Telemetry analysis ──────────────────────────────────────────
  const telemetryAnalysis = vehicleDynamics.analyzePerformance
    ? vehicleDynamics.analyzePerformance(vehicleSpeed, engineRpm, engineTemperature, currentGear)
    : null;

  // ── Push telemetry to API ───────────────────────────────────────
  const telRef = useRef({});
  telRef.current = {
    sessionId, engineRunning, currentGear,
    speed: vehicleSpeed, speedKmh,
    rpm: engineRpm, temperature: engineTemperature,
    fuelLevel, fuelEconomy, engineLoad,
    horsepower: currentHorsepower,
    acceleratorPosition, brakePosition,
    efficiency: telemetryAnalysis?.efficiency ?? 100,
    currentMode: telemetryAnalysis?.currentMode ?? "EFFICIENCY",
    recommendations: telemetryAnalysis?.recommendations ?? [],
  };

  useEffect(() => {
    const push = () => {
      fetch("/api/telemetry/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telRef.current),
      }).catch(() => { });
    };
    push();
    if (!engineRunning) return;
    const id = setInterval(push, 80); // 80ms = ~12fps of telemetry pushes
    return () => clearInterval(id);
  }, [engineRunning]);

  // Temperature warning: persists even when speed = 0
  const tempHot = engineTemperature > 95;
  const tempCritical = engineTemperature > 108;
  const tempColor = tempCritical ? '#ff2222' : tempHot ? '#ff7722' : '#ffffff';
  const tempGlow = tempCritical ? '#ff222288' : tempHot ? '#ff772255' : 'transparent';

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* 3D Car */}
      <div className="absolute inset-0">
        <Visualization
          engineRunning={engineRunning}
          currentGear={currentGear}
          speed={vehicleSpeed}
          rpm={engineRpm}
          isShifting={isShifting}
          temperature={engineTemperature}
          engineLoad={engineLoad}
          viewMode={viewMode}
          setViewMode={setViewMode}
          viewOptions={cameraViews}
          useCustomModel={false}
          modelPath={modelPath}
          brakePosition={brakePosition}
        />
      </div>

      {/* HUD */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none select-none">

        {/* ── Top strip: fuel bar ── */}
        <div className="flex justify-between items-center px-5 pt-5 pb-2">
          {/* Fuel */}
          <div className="flex flex-col gap-1">
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30">FUEL</div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${fuelLevel}%`,
                    background: fuelLevel > 30 ? '#00eaff' : '#ff4444',
                  }}
                />
              </div>
              <span className="text-xs font-mono text-white/50">{Math.round(fuelLevel)}%</span>
            </div>
          </div>

          {/* Engine status pill + temp warning */}
          <div className="flex items-center gap-2">
            {/* Persistent temp warning even at speed 0 */}
            {tempHot && (
              <div
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border tracking-widest ${tempCritical
                  ? 'border-red-500/60 text-red-400 bg-red-500/15 animate-pulse'
                  : 'border-orange-500/50 text-orange-400 bg-orange-500/10'
                  }`}
                style={{ boxShadow: tempCritical ? '0 0 12px #ff222244' : '0 0 8px #ff772233' }}
              >
                🌡 {Math.round(engineTemperature)}°C
              </div>
            )}
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono border tracking-widest ${engineRunning
              ? 'border-cyan-400/40 text-cyan-400 bg-cyan-400/10'
              : 'border-white/15 text-white/30 bg-transparent'
              }`}>
              {engineRunning ? '● ON' : '○ OFF'}
            </div>
          </div>
        </div>

        {/* nothing in center — car is the focus */}

        {/* ── Bottom: Gear selector + controls ── */}
        <div className="pointer-events-auto px-5 pb-6 flex flex-col gap-3">

          {/* Gear + pedal row */}
          <div className="flex items-end justify-between">
            {/* Pedal bars */}
            <div className="flex gap-3">
              {/* Accel */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-2.5 h-12 rounded-full bg-white/5 border border-cyan-400/20 overflow-hidden flex flex-col-reverse">
                  <div
                    className="w-full bg-cyan-400 rounded-full transition-all duration-75"
                    style={{ height: `${acceleratorPosition}%` }}
                  />
                </div>
                <div className="text-[8px] font-mono text-white/20">W</div>
              </div>
              {/* Brake */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-2.5 h-12 rounded-full bg-white/5 border border-red-400/20 overflow-hidden flex flex-col-reverse">
                  <div
                    className="w-full bg-red-400 rounded-full transition-all duration-75"
                    style={{ height: `${brakePosition}%` }}
                  />
                </div>
                <div className="text-[8px] font-mono text-white/20">S</div>
              </div>
            </div>

            {/* Current gear BIG */}
            <div className="flex flex-col items-center">
              <div className="text-[9px] font-mono text-white/25 tracking-widest mb-0.5">GEAR</div>
              <div
                className="font-mono font-black text-5xl leading-none"
                style={{ color: '#00eaff', textShadow: '0 0 20px #00eaff66' }}
              >
                {currentGear}
              </div>
            </div>

            {/* Engine toggle */}
            <button
              onClick={toggleEngine}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all duration-200 ${engineRunning
                ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400'
                : 'bg-white/5 border-white/15 text-white/50 hover:border-white/30 hover:text-white/80'
                }`}
            >
              {engineRunning ? '■ STOP' : '▶ START'}
            </button>
          </div>

          {/* Speed in bottom-left corner + gear buttons */}
          <div className="flex items-end gap-4">
            {/* Speed corner block */}
            <div className="flex flex-col items-start leading-none">
              <div
                className="font-mono font-black leading-none"
                style={{
                  fontSize: 52,
                  color: tempColor,
                  textShadow: `0 0 28px ${speedKmh > 150 ? '#ff444488' : tempHot ? tempGlow : '#00eaff33'}`,
                  transition: 'color 0.4s, text-shadow 0.4s',
                }}
              >
                {speedKmh}
              </div>
              <div className="text-[9px] font-mono text-white/25 tracking-widest mt-0.5">KM/H</div>
            </div>

            {/* Gear buttons fill the rest */}
            <div className="flex gap-1.5 flex-1">
              {availableGears.map((g) => (
                <button
                  key={g}
                  onClick={() => changeGear(g)}
                  className={`flex-1 h-8 rounded-lg text-xs font-bold font-mono border transition-all duration-150 ${currentGear === g
                    ? 'bg-cyan-400/20 border-cyan-400/60 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70'
                    } ${isShifting && currentGear === g ? 'animate-pulse' : ''}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={resetVehicle}
            className="w-full py-1.5 rounded-lg text-[10px] font-mono font-bold border border-white/8 text-white/25 hover:border-white/20 hover:text-white/40 transition-all"
          >
            ↺ RESET
          </button>
        </div>
      </div>

      <SoundSystem
        engineRunning={engineRunning}
        rpm={engineRpm}
        speed={vehicleSpeed}
        gear={currentGear}
        brakePosition={brakePosition}
        acceleratorPosition={acceleratorPosition}
      />
      <HelpModal showHelp={showHelp} setShowHelp={setShowHelp} />

      {/* Shift Error Overlay */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-300 ${shiftError ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-red-600/20 border border-red-500/50 backdrop-blur-md px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <div className="text-red-400 font-mono font-bold text-lg tracking-widest uppercase">Invalid Gear Jump</div>
          <div className="text-red-300/60 font-mono text-center text-xs mt-1">Sequential Shifting Only (±1)</div>
        </div>
      </div>
    </div>
  );
}
