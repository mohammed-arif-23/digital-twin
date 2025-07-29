"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Car, Settings, Cog } from "lucide-react";
import { CarDynamics } from "@/lib/carDynamics";
import { ControlPanel } from "@/components/ui/ControlPanel";
import { PedalControls } from "@/components/ui/PedalControls";
import { Visualization } from "@/components/ui/Visualization";
import { HelpModal } from "@/components/ui/HelpModal";
import { SoundSystem } from "@/components/ui/SoundSystem";
import { Telemetry } from "@/components/ui/Telemetry";
import dynamic from 'next/dynamic';
import StatPanel from '@/components/ui/StatPanel';
const TelemetryChart = dynamic(() => import('@/components/ui/TelemetryChart'), { ssr: false });
const CircularGauge = dynamic(() => import('@/components/ui/CircularGauge'), { ssr: false });

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
  const [engineStatus, setEngineStatus] = useState({
    status: "OFF",
    color: "gray",
  });
  const [showHelp, setShowHelp] = useState(false);
  const [viewMode, setViewMode] = useState("track");
  const [modelPath, setModelPath] = useState(null);
  const [acceleratorPosition, setAcceleratorPosition] = useState(0);
  const [brakePosition, setBrakePosition] = useState(0);
  const [currentHorsepower, setCurrentHorsepower] = useState(0);
  const [lapTime, setLapTime] = useState(0);
  const [bestLap, setBestLap] = useState(999.999);

  const vehicleDynamics = useRef(new CarDynamics()).current;
  const lastUpdateTime = useRef(Date.now());
  const lapStartTime = useRef(Date.now());

  const availableGears = ["P", "R", "N", "D", "1", "2", "3", "4", "5"];
  const cameraViews = [
    { key: "track", label: "Track", icon: Car },
    { key: "engine", label: "Engine", icon: Cog },
  ];

  useEffect(() => {
    setSessionId(`session_${Date.now()}`);
  }, []);

  useEffect(() => {
    if (!engineRunning) {
      setEngineRpm(0);
      setCurrentHorsepower(0);
      return;
    }

    const updateInterval = setInterval(() => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = currentTime;

      vehicleDynamics.setAcceleratorPedal(acceleratorPosition);
      vehicleDynamics.setBrakePedal(brakePosition);

      const newSpeed = vehicleDynamics.calculateTargetSpeed(
        vehicleSpeed,
        currentGear,
        deltaTime
      );
      setVehicleSpeed(newSpeed);

      const newRpm = vehicleDynamics.calculateRPM(
        newSpeed,
        currentGear,
        engineRunning
      );
      setEngineRpm(newRpm);

      const throttlePosition = acceleratorPosition / 100;
      const horsepower = vehicleDynamics.calculateCurrentHorsepower(
        newRpm,
        throttlePosition
      );
      setCurrentHorsepower(horsepower);

      setEngineTemperature((previousTemperature) => {
        return vehicleDynamics.calculateTemperature(
          newSpeed,
          newRpm,
          previousTemperature,
          deltaTime,
          engineRunning
        );
      });

      const fuelConsumptionRate = vehicleDynamics.calculateFuelConsumption(
        newSpeed,
        newRpm,
        currentGear,
        deltaTime
      );
      setFuelLevel((previousFuel) => Math.max(0, previousFuel - fuelConsumptionRate));

      const instantMileage = vehicleDynamics.calculateMileage(
        newSpeed,
        fuelConsumptionRate
      );
      setFuelEconomy(instantMileage);

      const load = vehicleDynamics.calculateEngineLoad(newSpeed, newRpm);
      setEngineLoad(load);

      vehicleDynamics.analyzePerformance(newSpeed, newRpm, engineTemperature, currentGear);

    }, 50);

    return () => clearInterval(updateInterval);
  }, [
    engineRunning,
    vehicleSpeed,
    currentGear,
    acceleratorPosition,
    brakePosition,
    vehicleDynamics,
    engineTemperature
  ]);

  const toggleEngine = () => {
    setEngineRunning(!engineRunning);
    if (!engineRunning) {
      setEngineRpm(800);
      setEngineTemperature(85);
    } else {
      setEngineRpm(0);
      setVehicleSpeed(0);
      setEngineTemperature(20);
      setCurrentGear("P");
    }
  };

  const changeGear = (gear) => {
    if (!engineRunning && gear !== "P") return;

    setIsShifting(true);
    setCurrentGear(gear);
    setTimeout(() => setIsShifting(false), 500);
  };

  const resetVehicle = () => {
    setEngineRunning(false);
    setCurrentGear("P");
    setVehicleSpeed(0);
    setEngineRpm(0);
    setEngineTemperature(85);
    setFuelLevel(75);
    setFuelEconomy(0);
    setEngineLoad(0);
    setEngineStatus({ status: "OFF", color: "gray" });
    setIsShifting(false);
    setAcceleratorPosition(0);
    setBrakePosition(0);
    setCurrentHorsepower(0);
    setLapTime(0);
    setBestLap(999.999);
    lapStartTime.current = Date.now();
  };

  const updateAcceleratorPosition = (position) => {
    setAcceleratorPosition(position);
  };

  const updateBrakePosition = (position) => {
    setBrakePosition(position);
  };

  const saveVehicleState = useCallback(async () => {
    try {
      const response = await fetch("/api/car-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engineRunning,
          currentGear,
          speed: vehicleSpeed,
          rpm: engineRpm,
          temperature: engineTemperature,
          fuel: fuelLevel,
          mileage: fuelEconomy,
          sessionId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      
    }
  }, [
    engineRunning,
    currentGear,
    vehicleSpeed,
    engineRpm,
    engineTemperature,
    fuelLevel,
    fuelEconomy,
    sessionId,
  ]);

  useEffect(() => {
    if (engineRunning) {
      const saveInterval = setInterval(saveVehicleState, 5000);
      return () => clearInterval(saveInterval);
    }
  }, [engineRunning, saveVehicleState]);

  useEffect(() => {
    const handleKeyboardInput = (event) => {
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      )
        return;

      switch (event.key.toLowerCase()) {
        case "e":
          toggleEngine();
          break;
        case "r":
          resetVehicle();
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          if (engineRunning) changeGear(event.key);
          break;
        case "d":
          if (engineRunning) changeGear("D");
          break;
        case "p":
          changeGear("P");
          break;
        case "n":
          if (engineRunning) changeGear("N");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyboardInput);
    return () => window.removeEventListener("keydown", handleKeyboardInput);
  }, [engineRunning, currentGear]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.repeat) return;
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') setAcceleratorPosition(100);
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') setBrakePosition(100);
    }
    function handleKeyUp(e) {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') setAcceleratorPosition(0);
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') setBrakePosition(0);
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const speedKmh = Math.round(vehicleSpeed * 1.60934);

  const gearMaxSpeeds = {
    P: 0,
    R: 30,
    N: 0,
    D: 0,
    '1': 30,
    '2': 60,
    '3': 90,
    '4': 130,
    '5': 180,
  };

  let telemetry = vehicleDynamics.analyzePerformance
    ? vehicleDynamics.analyzePerformance(vehicleSpeed, engineRpm, engineTemperature, currentGear)
    : null;

  if (telemetry) {
    const maxSpeed = gearMaxSpeeds[currentGear] || 9999;
    if (speedKmh >= maxSpeed && currentGear !== 'P' && currentGear !== 'N') {
      telemetry = {
        ...telemetry,
        recommendations: [
          {
            type: 'gear',
            severity: 'high',
            message: 'Change gear! Current gear has reached its max speed.'
          },
          ...telemetry.recommendations,
        ],
      };
    }
  }

  const [rpmHistory, setRpmHistory] = useState(Array.from({ length: 60 }, (_, i) => ({ name: i, value: 0 })));
  const [speedHistory, setSpeedHistory] = useState(Array.from({ length: 60 }, (_, i) => ({ name: i, value: 0 })));
  useEffect(() => {
    const interval = setInterval(() => {
      setRpmHistory(prev => ([...prev.slice(1), { name: prev.length, value: Math.round(engineRpm) }]));
      setSpeedHistory(prev => ([...prev.slice(1), { name: prev.length, value: Math.round(speedKmh) }]));
    }, 50);
    return () => clearInterval(interval);
  }, [engineRpm, speedKmh]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
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

      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col">
        <div className="flex flex-row justify-between items-start w-full px-8 pt-4 gap-6">
          <div className="flex flex-col gap-4 min-w-[120px]">
            <StatPanel title="FUEL" value={Math.round(fuelLevel)} unit="%" color="#00eaff" />
          </div>
        </div>
        <div className="flex-1 flex flex-row items-center justify-between w-full px-8 gap-8 mt-4">
          <div className="flex flex-col gap-4 min-w-[120px]">
            <CircularGauge value={engineRpm} max={9000} label="RPM" color="#00eaff" size={120} />
          </div>
          <div className="flex flex-col gap-4 min-w-[120px]">
            <CircularGauge value={speedKmh} max={9000} label="SPEED" unit="km/h" color="#00eaff" size={120} />
          </div>
          <div className="flex flex-col items-center justify-center">
            <CircularGauge
              value={speedKmh}
              max={360}
              label="SPEED"
              unit="km/h"
              color="#00eaff"
              size={260}
              showNeedle={true}
              showTicks={true}
            />
          </div>
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-4 min-w-[320px] max-w-[340px] w-full pointer-events-auto">
          <TelemetryChart data={rpmHistory} dataKey="value" color="#00eaff" label="RPM HISTORY" />
          <TelemetryChart data={speedHistory} dataKey="value" color="#00eaff" label="SPEED HISTORY" />
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl border-2 border-cyan-400/70 p-4 shadow-[0_0_32px_#00eaff55] font-jarvis mt-2">
            <div className="text-cyan-300 text-xs mb-2 font-bold tracking-widest">TELEMETRY</div>
            {telemetry ? (
              <>
                <div className="flex flex-col gap-1 mb-2 text-cyan-200">
                  <div className="flex justify-between text-xs"><span>Efficiency</span><span className="font-mono text-2xl font-bold" style={{ color: getEfficiencyColor(telemetry.efficiency) }}>{telemetry.efficiency}%</span></div>
                  <div className="flex justify-between text-xs"><span>Power</span><span className="text-purple-400 text-2xl font-bold">{Math.round(telemetry.metrics.horsepower)} HP</span></div>
                  <div className="flex justify-between text-xs"><span>RPM</span><span className="text-cyan-400 text-2xl">{Math.round(telemetry.metrics.rpm)}</span></div>
                  <div className="flex justify-between text-xs"><span>Temp</span><span className="text-orange-400 text-2xl">{Math.round(telemetry.metrics.temperature)}°C</span></div>
                  {telemetry.metrics.gearEfficiency !== undefined && (
                    <div className="flex justify-between text-xs"><span>Gear Eff.</span><span className="text-green-300 text-2xl">{Math.round(telemetry.metrics.gearEfficiency)}%</span></div>
                  )}
                  {telemetry.currentMode && (
                    <div className="flex justify-between text-xs"><span>Mode</span><span className="text-cyan-400 text-2xl">{telemetry.currentMode}</span></div>
                  )}
                </div>
                <div className="h-1 w-full bg-cyan-400/30 rounded-full my-2" />
                <div className="text-cyan-300 text-xs font-bold mb-1 tracking-widest">RECOMMENDATIONS</div>
                <div className="space-y-1">
                  {telemetry.recommendations.map((rec, idx) => (
                    <div key={idx} className={`p-2 rounded text-xs font-mono ${rec.severity === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : rec.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}`}>{rec.message}</div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-xs">No telemetry data</div>
            )}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 flex flex-col gap-4 min-w-[220px] pointer-events-auto">
          <StatPanel title="GEAR" value={currentGear} color="#00eaff" />
          <StatPanel title="ENGINE" value={engineRunning ? 'ON' : 'OFF'} color={engineRunning ? '#00eaff' : '#ff0033'} />
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
    </div>
  );
}

function getEfficiencyColor(efficiency) {
  if (efficiency >= 90) return '#4ade80';
  if (efficiency >= 75) return '#facc15';
  if (efficiency >= 50) return '#fb923c';
  return '#f87171';
}
