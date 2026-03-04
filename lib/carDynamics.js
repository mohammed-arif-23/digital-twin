export class CarDynamics {
  constructor() {
    // ── Engine specs (realistic V8 supercar) ─────────────────────────
    this.engineSpecs = {
      engineType: "V8",
      pistons: 8,
      strokesPerCycle: 2,
      idleRPM: 850,
      maxRPM: 8200,
      redlineRPM: 7800,
      maxHorsepower: 700,   // @ 6500 RPM
      maxTorque: 850,        // Nm @ 4200 RPM
      displacement: 8.0,
    };

    // ── Realistic gear ratios (like a C7 Corvette Z06) ───────────────
    this.gearRatios = {
      P: 0,
      R: -3.82,
      N: 0,
      D: 2.66,  // auto 1st
      "1": 4.06,
      "2": 2.37,
      "3": 1.55,
      "4": 1.16,
      "5": 0.86,
    };
    this.finalDriveRatio = 3.42;
    this.wheelRadius = 0.337; // m

    // ── Vehicle mass & drag ──────────────────────────────────────────
    this.vehicleMass = 1530;   // kg
    this.dragCoeff = 0.52;     // raised — realistic high-speed aero resistance
    this.frontalArea = 2.1;    // m²
    this.airDensity = 1.225;   // kg/m³
    this.rollingResistance = 0.015; // slightly higher (tires, drivetrain losses)
    this.g = 9.81;
    this.maxSpeedMs = 88.9;    // absolute cap ≈ 320 km/h (realistic V8 supercar)

    // ── Thermal ─────────────────────────────────────────────────────
    this.baseTemp = 90;
    this.ambientTemp = 25;

    // ── Fuel ────────────────────────────────────────────────────────
    this.fuelCapacity = 75;

    // ── Pedal state ──────────────────────────────────────────────────
    this.pedalStates = { accelerator: 0, brake: 0 };

    // ── Performance tracking ─────────────────────────────────────────
    this.performanceMetrics = {
      optimalRpmRange: [2200, 6500],
      optimalTempRange: [88, 100],
      fuelEfficiencyTarget: 12,
      lastAnalysis: Date.now(),
      analysisInterval: 1000,
      recommendations: [],
      currentEfficiency: 100,
      peakPowerMode: false,
    };

    this.performanceHistory = {
      rpm: [], temperature: [], horsepower: [], fuelConsumption: [], maxSamples: 100,
    };
  }

  // ── RPM ────────────────────────────────────────────────────────────
  calculateRPM(speedMs, gear, engineRunning = true) {
    if (!engineRunning) return 0;
    if (gear === "P" || gear === "N") return this.engineSpecs.idleRPM;
    const gr = this.gearRatios[gear];
    if (!gr || gr === 0) return this.engineSpecs.idleRPM;
    // wheel circumference = 2π × r, so wheelRPS = speedMs / (2π × r)
    const wheelRPS = speedMs / (2 * Math.PI * this.wheelRadius);
    const engineRPS = Math.abs(wheelRPS * gr * this.finalDriveRatio);
    let rpm = engineRPS * 60;
    return Math.max(this.engineSpecs.idleRPM, Math.min(rpm, this.engineSpecs.maxRPM));
  }

  // ── Torque curve (realistic bell shape, peak at ~4200 RPM) ────────
  getTorqueAtRPM(rpm) {
    const { idleRPM, maxRPM, maxTorque } = this.engineSpecs;
    const normalised = (rpm - idleRPM) / (maxRPM - idleRPM);
    // Gaussian-like peak at 55% of RPM range (≈4200 for 8200 max)
    const peakPos = 0.55;
    const width = 0.35;
    const curve = Math.exp(-Math.pow((normalised - peakPos) / width, 2));
    return Math.max(0, maxTorque * curve);
  }

  // ── Speed physics (Newton's 2nd law with drag) ─────────────────────
  calculateTargetSpeed(currentSpeedMs, gear, deltaTime) {
    if (gear === "P" || gear === "N") {
      // Friction brings to stop
      return Math.max(0, currentSpeedMs - 5 * deltaTime);
    }

    const acc = this.pedalStates.accelerator / 100;
    const brk = this.pedalStates.brake / 100;

    // Wheel/engine torque → force at wheels
    const rpm = this.calculateRPM(currentSpeedMs, gear, true);
    const torque = this.getTorqueAtRPM(rpm) * acc;
    const gr = Math.abs(this.gearRatios[gear] || 1);
    const driveForce = (torque * gr * this.finalDriveRatio) / this.wheelRadius;

    // Aero drag  F_drag = 0.5 * rho * Cd * A * v²
    const dragForce = 0.5 * this.airDensity * this.dragCoeff * this.frontalArea * currentSpeedMs * currentSpeedMs;

    // Rolling resistance
    const frForce = this.rollingResistance * this.vehicleMass * this.g;

    // Brake force (proportional, rough model)
    const brakeForce = brk * 18000; // max ~1.2g braking

    // Net force
    const isReverse = gear === "R";
    let netForce = (isReverse ? -driveForce : driveForce) - dragForce - frForce - brakeForce;

    // Prevent pushing backward with brakes
    if (brakeForce > 0 && currentSpeedMs <= 0) netForce = 0;

    const accelMs2 = netForce / this.vehicleMass;
    let newSpeed = currentSpeedMs + accelMs2 * deltaTime;

    if (isReverse) {
      newSpeed = Math.max(newSpeed, -8.0);
    } else {
      newSpeed = Math.max(0, newSpeed);
    }

    // Gear-limited top speed (from max RPM)
    const maxSpeedForGear = this._maxSpeedForGear(gear);
    if (!isReverse) newSpeed = Math.min(newSpeed, maxSpeedForGear, this.maxSpeedMs);

    return newSpeed;
  }

  _maxSpeedForGear(gear) {
    const gr = Math.abs(this.gearRatios[gear] || 1);
    if (gr === 0) return 0;
    // maxWheelRPS at redline, then multiply by circumference (2π × r)
    const maxWheelRPS = (this.engineSpecs.maxRPM / 60) / (gr * this.finalDriveRatio);
    return maxWheelRPS * 2 * Math.PI * this.wheelRadius;
  }

  // ── Temperature ─────────────────────────────────────────────────────
  // Cooldown is active even when stopped (radiator + natural convection)
  // Hot engine stays warm for ~60s after shutoff — realistic soak behaviour
  calculateTemperature(speedMs, rpm, currentTemp, deltaTime, engineRunning) {
    if (!engineRunning) {
      // Passive cooling: faster when hotter, also faster when moving (ram air)
      const excessTemp = currentTemp - this.ambientTemp;
      const passiveCool = excessTemp * 0.018;          // ~60s to drop from 100→25
      const ramCool = speedMs * 0.06 * (excessTemp / 80); // moving helps
      const totalCool = (passiveCool + ramCool) * deltaTime;
      return Math.max(this.ambientTemp, currentTemp - totalCool);
    }
    // Constant idle heat so engine stays warm at idle
    const idleHeat = 0.35;
    const rpmHeat = Math.max(0, (rpm - this.engineSpecs.idleRPM) / this.engineSpecs.maxRPM) * 0.9;
    const loadHeat = (this.pedalStates.accelerator / 100) * 1.4;
    const heatIn = (idleHeat + rpmHeat + loadHeat) * deltaTime;
    // Idle fan is weak (0.25); ram air kicks in above 2 m/s
    const airCool = speedMs > 2 ? Math.min(speedMs * 0.055, 6) : 0.25;
    const radCool = Math.max(0, (currentTemp - this.baseTemp) * 0.03);
    const heatOut = (airCool + radCool) * deltaTime;
    const dT = (heatIn - heatOut) * 0.03;
    return Math.max(this.ambientTemp, Math.min(currentTemp + dT, 118));
  }

  // ── Engine load ────────────────────────────────────────────────────
  calculateEngineLoad(speedMs, rpm) {
    if (rpm <= this.engineSpecs.idleRPM) return 5;
    const rpmR = (rpm - this.engineSpecs.idleRPM) / (this.engineSpecs.maxRPM - this.engineSpecs.idleRPM);
    const spdR = speedMs / 70; // 70 m/s ≈ 252 km/h reference
    return Math.min(95, Math.max(5, rpmR * 50 + Math.pow(spdR, 2) * 40 + 5));
  }

  // ── Fuel consumption (BSFC-based) ─────────────────────────────────
  calculateFuelConsumption(speedMs, rpm, gear, deltaTime) {
    if (rpm === 0) return 0;
    const throttle = this.pedalStates.accelerator / 100;
    // Brake-specific fuel consumption: ~250 g/kWh at peak, worse at light load
    const power = this.calculateCurrentHorsepower(rpm, throttle) * 745.7; // W
    const bsfc = 260 + (1 - throttle) * 120; // g/kWh, lighter load = richer mix
    const fuelGs = (power * bsfc) / (3600 * 1000); // g/s
    const fuelLs = fuelGs / 750; // density ~750 g/L for petrol
    return Math.max(0, fuelLs * deltaTime);
  }

  // ── Mileage ───────────────────────────────────────────────────────
  calculateMileage(speedMs, fuelRate) {
    if (fuelRate === 0 || speedMs === 0) return 0;
    const speedKmh = speedMs * 3.6;
    const fuelLph = fuelRate * 3600;
    return Math.max(0, speedKmh / fuelLph);
  }

  // ── Horsepower (realistic torque × RPM / 5252) ───────────────────
  calculateCurrentHorsepower(rpm, throttle = 1) {
    if (rpm === 0) return 0;
    const torque = this.getTorqueAtRPM(rpm) * throttle;
    // HP = Torque(Nm) × RPM / 9549
    const hp = (torque * rpm) / 9549;
    return Math.min(hp, this.engineSpecs.maxHorsepower);
  }

  // ── Pedal setters ─────────────────────────────────────────────────
  setAcceleratorPedal(pos) { this.pedalStates.accelerator = Math.max(0, Math.min(100, pos)); }
  setBrakePedal(pos) { this.pedalStates.brake = Math.max(0, Math.min(100, pos)); }
  getPedalStates() { return { ...this.pedalStates }; }

  // ── Gear efficiency ───────────────────────────────────────────────
  getGearEfficiency(gear, speedMs) {
    // Optimal speed range per gear (m/s)
    const optimal = { "1": 6, "2": 14, "3": 22, "4": 32, "5": 45, D: 22, R: 3, P: 0, N: 0 };
    const opt = optimal[gear] ?? 20;
    if ((gear === "N" || gear === "P") && speedMs > 0.5) return 0.1;
    const diff = Math.abs(speedMs - opt);
    return Math.max(0.25, 1 - diff / 40);
  }

  // ── Performance analysis ──────────────────────────────────────────
  analyzePerformance(speedMs, rpm, temperature, currentGear) {
    const now = Date.now();
    const elapsed = now - this.performanceMetrics.lastAnalysis;
    const throttle = this.pedalStates.accelerator / 100;
    const hp = this.calculateCurrentHorsepower(rpm, throttle);
    const gearEff = this.getGearEfficiency(currentGear, speedMs);

    this._updateHistory(rpm, temperature, hp,
      this.calculateFuelConsumption(speedMs, rpm, currentGear, elapsed / 1000));

    // Return cached if within interval
    if (elapsed < this.performanceMetrics.analysisInterval) {
      return {
        efficiency: this.performanceMetrics.currentEfficiency,
        recommendations: this.performanceMetrics.recommendations,
        currentMode: this.performanceMetrics.peakPowerMode ? "POWER" : "EFFICIENCY",
        metrics: { temperature, rpm, horsepower: hp, gearEfficiency: Math.round(gearEff * 100) },
      };
    }

    this.performanceMetrics.lastAnalysis = now;
    const recs = [];
    let score = Math.round(gearEff * 100);
    const numericGears = ["1", "2", "3", "4", "5"];
    const gearIdx = numericGears.indexOf(currentGear);
    const speedKmh = Math.round(speedMs * 3.6);

    // ── Temperature warnings ────────────────────────────────────
    if (temperature > this.performanceMetrics.optimalTempRange[1]) {
      const penalty = Math.min(20, Math.round((temperature - this.performanceMetrics.optimalTempRange[1]) * 1.2));
      score = Math.max(0, score - penalty);
      const severity = temperature > 108 ? "high" : "medium";
      recs.push({
        type: "temperature", severity,
        message: temperature > 108
          ? `⚠️ Critical: Engine ${Math.round(temperature)}°C. Stop immediately and let it cool.`
          : `Engine ${Math.round(temperature)}°C — above safe range. Reduce throttle and speed.`
      });
    } else if (temperature < this.performanceMetrics.optimalTempRange[0]) {
      recs.push({
        type: "temperature", severity: "low",
        message: `Engine warming up (${Math.round(temperature)}°C). Avoid full throttle until 88°C.`
      });
    }

    // ── Gear efficiency / shift recommendations ───────────────────
    const [rpmLo, rpmHi] = this.performanceMetrics.optimalRpmRange;

    if (gearEff < 0.6) {
      score = Math.max(0, score - 10);
    }

    if (rpm > rpmHi && gearIdx !== -1 && gearIdx < numericGears.length - 1) {
      // Over-revving: upshift needed
      const targetGear = numericGears[gearIdx + 1];
      const penalty = Math.min(15, Math.round(((rpm - rpmHi) / 500) * 5));
      score = Math.max(0, score - penalty);
      recs.push({
        type: "gear", severity: rpm > this.engineSpecs.redlineRPM ? "high" : "medium",
        message: rpm > this.engineSpecs.redlineRPM
          ? `🚨 Redline! RPM ${Math.round(rpm)} — Upshift to ${targetGear} now!`
          : `RPM ${Math.round(rpm)} — Upshift to gear ${targetGear} for efficiency.`
      });
    } else if (rpm > rpmHi && gearIdx === numericGears.length - 1) {
      recs.push({
        type: "gear", severity: "medium",
        message: `RPM ${Math.round(rpm)} — Already in top gear. Ease off throttle.`
      });
    }

    if (rpm < rpmLo && speedMs > 5 && gearIdx > 0) {
      // Lugging: downshift needed
      const targetGear = numericGears[gearIdx - 1];
      recs.push({
        type: "gear", severity: rpm < 1200 ? "high" : "low",
        message: rpm < 1200
          ? `⚠️ Engine lugging (${Math.round(rpm)} RPM) — Downshift to ${targetGear} immediately!`
          : `Low RPM (${Math.round(rpm)}) — Downshift to gear ${targetGear} for better pull.`
      });
    }

    if (speedMs > 5 && (currentGear === "N" || currentGear === "P")) {
      recs.push({
        type: "gear", severity: "high",
        message: `⚠️ Car is moving in ${currentGear} — Select a drive gear!`
      });
    }

    if (gearEff < 0.5 && gearIdx !== -1) {
      // Wrong gear for current speed
      const betterIdx = Math.round(speedMs / 15); // rough heuristic
      const betterGear = numericGears[Math.min(Math.max(betterIdx, 0), numericGears.length - 1)];
      if (betterGear !== currentGear) {
        recs.push({
          type: "gear", severity: "low",
          message: `Gear ${currentGear} is inefficient at ${speedKmh} km/h. Consider gear ${betterGear}.`
        });
      }
    }

    // ── Power / fuel ───────────────────────────────────────────
    if (hp > 500 && throttle > 0.9) {
      recs.push({
        type: "power", severity: "medium",
        message: `Full power burst (${Math.round(hp)} HP). High fuel consumption — ease off if not racing.`
      });
    }

    this.performanceMetrics.recommendations = recs;
    this.performanceMetrics.currentEfficiency = Math.max(0, score);

    return {
      efficiency: this.performanceMetrics.currentEfficiency,
      recommendations: recs,
      currentMode: this.performanceMetrics.peakPowerMode ? "POWER" : "EFFICIENCY",
      metrics: { temperature, rpm, horsepower: hp, gearEfficiency: Math.round(gearEff * 100) },
    };
  }

  _updateHistory(rpm, temperature, hp, fuel) {
    const h = this.performanceHistory;
    h.rpm.push(rpm); h.temperature.push(temperature);
    h.horsepower.push(hp); h.fuelConsumption.push(fuel);
    if (h.rpm.length > h.maxSamples) {
      h.rpm.shift(); h.temperature.shift(); h.horsepower.shift(); h.fuelConsumption.shift();
    }
  }

  togglePerformanceMode() {
    this.performanceMetrics.peakPowerMode = !this.performanceMetrics.peakPowerMode;
    if (this.performanceMetrics.peakPowerMode) {
      this.performanceMetrics.optimalRpmRange = [3500, 7200];
      this.performanceMetrics.optimalTempRange = [92, 105];
    } else {
      this.performanceMetrics.optimalRpmRange = [2200, 6500];
      this.performanceMetrics.optimalTempRange = [88, 100];
    }
    return this.performanceMetrics.peakPowerMode ? "POWER" : "EFFICIENCY";
  }

  getPerformanceHistory() { return this.performanceHistory; }

  // Kept for compatibility
  calculatePistonStrokesPerMinute(rpm) {
    return rpm * this.engineSpecs.strokesPerCycle * this.engineSpecs.pistons;
  }
  getEngineStatus(rpm, temperature) {
    if (rpm === 0) return { status: "OFF", color: "gray" };
    if (temperature > 108) return { status: "OVERHEATING", color: "red" };
    if (rpm >= this.engineSpecs.redlineRPM) return { status: "REDLINE", color: "red" };
    if (rpm > 5000) return { status: "HIGH_RPM", color: "yellow" };
    if (temperature > 100) return { status: "HOT", color: "orange" };
    return { status: "NORMAL", color: "green" };
  }
}

export default CarDynamics;