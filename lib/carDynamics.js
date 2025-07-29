export class CarDynamics {
  constructor() {
    this.engineSpecs = {
      engineType: "V8",
      pistons: 8,
      strokesPerCycle: 2,
      idleRPM: 800,
      maxRPM: 8400,
      redlineRPM: 8000,
      maxHorsepower: 700,
      maxTorque: 850, 
      displacement: 8.0 
    }
    this.gearRatios = {
      'P': 0,
      'R': -3.5,
      'N': 0,
      'D': 1,
      '1': 3.5,
      '2': 2.1,
      '3': 1.4,
      '4': 1.0,
      '5': 0.8
    }
    this.finalDriveRatio = 3.9
    this.wheelDiameter = 0.65
    this.baseTemp = 85
    this.ambientTemp = 20
    this.engineStartupDynamics = {
      initialStartTimeSecRange: [1.5, 2.5],
      fullStartTimeSecRange: [10, 20]
    }
    this.horsepowerSpeedMap = [
      { hpRange: [0, 100], speedKmhRange: [140, 180] },
      { hpRange: [100, 200], speedKmhRange: [180, 230] },
      { hpRange: [200, 300], speedKmhRange: [230, 260] },
      { hpRange: [300, 400], speedKmhRange: [260, 290] },
      { hpRange: [400, 500], speedKmhRange: [290, 310] },
      { hpRange: [500, 600], speedKmhRange: [310, 325] },
      { hpRange: [600, 700], speedKmhRange: [325, 350] }
    ]
    this.fuelSystem = {
      tankSizeLitersRange: [68, 85],
      rangeKmForTankSizeRange: [400, 850],
      fuelConsumptionRateLitersPer10km: 1.67
    }
    this.fuelCapacity = 75
    this.brakingSystem = {
      hydraulicBrakeReleaseInitialTimeSecRange: [0.1, 0.3],
      hydraulicBrakeFullReleaseTimeSecRange: [10, 20]
    }
    this.tireSpecs = {
      tireSize: "275/35 R20"
    }
    this.wheelRpmMap = [
      { speedKmhRange: [0, 10], wheelRpm: 76 },
      { speedKmhRange: [10, 20], wheelRpm: 152 },
      { speedKmhRange: [20, 30], wheelRpm: 227 },
      { speedKmhRange: [30, 40], wheelRpm: 303 },
      { speedKmhRange: [40, 50], wheelRpm: 379 },
      { speedKmhRange: [50, 60], wheelRpm: 455 },
      { speedKmhRange: [60, 70], wheelRpm: 530 },
      { speedKmhRange: [70, 80], wheelRpm: 606 },
      { speedKmhRange: [80, 90], wheelRpm: 682 },
      { speedKmhRange: [90, 100], wheelRpm: 758 }
    ]
    this.pedalStates = {
      accelerator: 0,
      brake: 0
    }

    this.performanceMetrics = {
      optimalHpRange: [0, 700],
      optimalTempRange: [85, 95],
      optimalRpmRange: [2000, 6000],
      fuelEfficiencyTarget: 15,
      lastAnalysis: Date.now(),
      analysisInterval: 1000,
      recommendations: [],
      currentEfficiency: 100,
      peakPowerMode: false
    }

    this.performanceHistory = {
      rpm: [],
      temperature: [],
      horsepower: [],
      fuelConsumption: [],
      maxSamples: 100
    }
  }
  calculateRPM(speed, gear, engineRunning = true) {
    if (!engineRunning) return 0
    if (gear === 'P' || gear === 'N') return this.engineSpecs.idleRPM
    const gearRatio = this.gearRatios[gear] || 1
    const speedMS = speed * 0.44704
    const wheelRPS = speedMS / (Math.PI * this.wheelDiameter)
    let rpm = Math.abs(wheelRPS * 60 * Math.abs(gearRatio) * this.finalDriveRatio)
    if (gear === 'D') {
      rpm = this.calculateAutoTransmissionRPM(speed)
    }
    return Math.max(this.engineSpecs.idleRPM, Math.min(rpm, this.engineSpecs.maxRPM))
  }
  calculateAutoTransmissionRPM(speed) {
    if (speed < 15) {
      return this.engineSpecs.idleRPM + (speed * 80)
    } else if (speed < 30) {
      return 2000 + ((speed - 15) * 60)
    } else if (speed < 50) {
      return 2900 + ((speed - 30) * 40)
    } else if (speed < 70) {
      return 3700 + ((speed - 50) * 30)
    } else {
      return 4300 + ((speed - 70) * 20)
    }
  }
  calculateTemperature(speed, rpm, currentTemp, deltaTime, engineRunning = true) {
    if (!engineRunning || rpm === 0) {
      const coolingRate = (currentTemp - this.ambientTemp) * 0.008;
      const newTemp = currentTemp - (coolingRate * deltaTime);
      return Math.max(this.ambientTemp, newTemp);
    }

    const targetTemp = this.baseTemp;

    const rpmHeat = rpm > this.engineSpecs.idleRPM 
      ? Math.max(0, (rpm - this.engineSpecs.idleRPM) * 0.001) 
      : 0;
    
    const loadHeat = speed > 0 
      ? this.calculateEngineLoad(speed, rpm) * 0.1 
      : 0;

    const airflowCooling = speed > 10 ? Math.min(speed * 0.05, 8) : 0;
    const radiatorCooling = Math.max(0, (currentTemp - targetTemp) * 0.03);
    
    const heatGeneration = rpmHeat + loadHeat;
    const coolingEffect = airflowCooling + radiatorCooling;
    const tempChange = (heatGeneration - coolingEffect) * deltaTime;
    
    if (speed === 0 && rpm <= this.engineSpecs.idleRPM * 1.1) {
      return Math.max(this.ambientTemp, Math.min(currentTemp, targetTemp + 2));
    }

    const newTemp = currentTemp + (tempChange * 0.02);
    return Math.max(this.ambientTemp, Math.min(newTemp, 115));
  }
  calculateEngineLoad(speed, rpm) {
    if (rpm <= this.engineSpecs.idleRPM) return 5
    const rpmRatio = (rpm - this.engineSpecs.idleRPM) / (this.engineSpecs.maxRPM - this.engineSpecs.idleRPM)
    const rpmLoad = Math.pow(rpmRatio, 1.5) * 40
    const speedRatio = speed / 100
    const speedLoad = Math.pow(speedRatio, 2) * 35
    const expectedRPMForSpeed = this.calculateExpectedRPM(speed)
    const accelerationLoad = rpm > expectedRPMForSpeed ? 
      Math.min((rpm - expectedRPMForSpeed) / 1000 * 20, 25) : 0
    const totalLoad = Math.min(rpmLoad + speedLoad + accelerationLoad + 5, 95)
    return Math.max(5, totalLoad)
  }
  calculateExpectedRPM(speed) {
    if (speed < 20) return 1200
    if (speed < 40) return 1800
    if (speed < 60) return 2200
    if (speed < 80) return 2600
    return 3000
  }
  calculateFuelConsumption(speed, rpm, gear, deltaTime) {
    if (rpm === 0) return 0
    const idleConsumption = 0.8
    const rpmRatio = rpm / this.engineSpecs.maxRPM
    const rpmConsumption = idleConsumption * (1 + rpmRatio * 8)
    const speedConsumption = Math.pow(speed / 100, 2.5) * 2
    const engineLoad = this.calculateEngineLoad(speed, rpm) / 100
    const loadConsumption = engineLoad * 4
    const gearEfficiency = this.getGearEfficiency(gear, speed)
    const gearPenalty = (1 - gearEfficiency) * 2
    const totalLPerHour = idleConsumption + rpmConsumption + speedConsumption + loadConsumption + gearPenalty
    const consumptionPerSecond = totalLPerHour / 3600
    return Math.max(0, consumptionPerSecond * deltaTime)
  }
  getGearEfficiency(gear, speed) {
    const optimalSpeeds = {
      '1': 15,
      '2': 25,
      '3': 40,
      '4': 60,
      '5': 80,
      'D': 50,
      'R': 5,
      'P': 0,
      'N': 0
    }
    const optimalSpeed = optimalSpeeds[gear] || 50
    const speedDifference = Math.abs(speed - optimalSpeed)
    const efficiency = Math.max(0.3, 1 - (speedDifference / 100));
    
    if ((gear === 'N' || gear === 'P') && speed > 0) {
      return 0.1;
    }
    
    return efficiency;
  }
  calculateMileage(speed, fuelConsumptionRate) {
    if (fuelConsumptionRate === 0 || speed === 0) return 0
    const speedKmH = speed * 1.60934
    const fuelConsumptionLPerHour = fuelConsumptionRate * 3600
    const fuelEconomy = speedKmH / fuelConsumptionLPerHour
    return Math.max(5, Math.min(fuelEconomy, 25))
  }
  getOptimalGear(speed) {
    if (speed < 10) return '1'
    if (speed < 25) return '2'
    if (speed < 45) return '3'
    if (speed < 65) return '4'
    return '5'
  }
  isInRedline(rpm) {
    return rpm >= this.engineSpecs.redlineRPM
  }
  getEngineStatus(rpm, temperature) {
    if (rpm === 0) return { status: 'OFF', color: 'gray' }
    if (temperature > 110) return { status: 'OVERHEATING', color: 'red' }
    if (this.isInRedline(rpm)) return { status: 'REDLINE', color: 'red' }
    if (rpm > 4000) return { status: 'HIGH_RPM', color: 'yellow' }
    if (temperature > 100) return { status: 'HOT', color: 'orange' }
    return { status: 'NORMAL', color: 'green' }
  }
  calculateRange(currentFuel, currentMileage) {
    if (currentMileage === 0) return 0
    return currentFuel * currentMileage
  }
  setAcceleratorPedal(position) {
    this.pedalStates.accelerator = Math.max(0, Math.min(100, position))
  }
  setBrakePedal(position) {
    this.pedalStates.brake = Math.max(0, Math.min(100, position))
  }
  getPedalStates() {
    return { ...this.pedalStates }
  }
  calculateTargetSpeed(currentSpeed, gear, deltaTime) {
    if (gear === 'P' || gear === 'N') return 0
    const acceleratorInput = this.pedalStates.accelerator / 100
    const brakeInput = this.pedalStates.brake / 100
    const maxSpeedForGear = this.getMaxSpeedForGear(gear)
    let acceleration = 0
    if (acceleratorInput > 0 && brakeInput === 0) {
      const powerRatio = acceleratorInput * (this.engineSpecs.maxHorsepower / 700)
      acceleration = powerRatio * 5 * deltaTime
      const gearMultiplier = this.getGearAccelerationMultiplier(gear)
      acceleration *= gearMultiplier
    }
    let deceleration = 0
    if (brakeInput > 0) {
      deceleration = brakeInput * 25 * deltaTime
    }
    const naturalDecel = currentSpeed > 0 ? 2 * deltaTime : 0
    let newSpeed = currentSpeed + acceleration - deceleration - naturalDecel
    newSpeed = Math.max(0, Math.min(newSpeed, maxSpeedForGear))
    return newSpeed
  }
  getMaxSpeedForGear(gear) {
    const maxSpeeds = {
      '1': 25,
      '2': 45,
      '3': 70,
      '4': 100,
      '5': 140,
      'D': 0,
      'R': 15,
      'P': 0,
      'N': 0
    }
    return maxSpeeds[gear] || 0
  }
  getGearAccelerationMultiplier(gear) {
    const multipliers = {
      '1': 2.5,
      '2': 2.0,
      '3': 1.5,
      '4': 1.2,
      '5': 1.0,
      'D': 1.3,
      'R': 1.8,
      'P': 0,
      'N': 0
    }
    return multipliers[gear] || 1
  }
  calculateCurrentHorsepower(rpm, throttlePosition = 1) {
    if (rpm === 0) return 0;
    const rpmRatio = rpm / this.engineSpecs.maxRPM;
    let powerCurve;
    if (rpmRatio < 0.3) {
      powerCurve = rpmRatio * 2;
    } else if (rpmRatio < 0.7) {
      powerCurve = 0.6 + (rpmRatio - 0.3) * 1.5;
    } else if (rpmRatio < 0.85) {
      powerCurve = 1.0;
    } else {
      powerCurve = 1.0 - (rpmRatio - 0.85) * 2;
    }
    const maxPower = this.engineSpecs.maxHorsepower * throttlePosition;
    return Math.max(0, maxPower * powerCurve);
  }
  calculatePistonStrokesPerMinute(rpm) {
    return rpm * this.engineSpecs.strokesPerCycle * this.engineSpecs.pistons
  }

  analyzePerformance(speed, rpm, temperature, currentGear) {
    const now = Date.now();
    const timeSinceLastAnalysis = now - this.performanceMetrics.lastAnalysis;
    
    const throttlePosition = this.pedalStates.accelerator / 100;
    const currentHp = this.calculateCurrentHorsepower(rpm, throttlePosition);
    const gearEfficiency = this.getGearEfficiency(currentGear, speed);
    
    this.updatePerformanceHistory(
      rpm, 
      temperature, 
      currentHp,
      this.calculateFuelConsumption(speed, rpm, currentGear, timeSinceLastAnalysis / 1000)
    );

    if (timeSinceLastAnalysis < this.performanceMetrics.analysisInterval) {
      return {
        efficiency: this.performanceMetrics.currentEfficiency,
        recommendations: this.performanceMetrics.recommendations,
        currentMode: this.performanceMetrics.peakPowerMode ? 'POWER' : 'EFFICIENCY',
        metrics: {
          temperature,
          rpm,
          horsepower: currentHp,
          gearEfficiency
        }
      };
    }

    this.performanceMetrics.lastAnalysis = now;
    const recommendations = [];
    let efficiencyScore = 100;

    const gearEfficiencyScore = Math.round(gearEfficiency * 100);
    efficiencyScore = gearEfficiencyScore;

    if (gearEfficiency < 0.6) {
      recommendations.push({
        type: 'gear',
        severity: 'medium',
        message: `Current gear efficiency: ${gearEfficiencyScore}%. Consider optimizing gear selection.`,
        efficiency: -(100 - gearEfficiencyScore)
      });
    }

    if (temperature > this.performanceMetrics.optimalTempRange[1]) {
      const overTemp = temperature - this.performanceMetrics.optimalTempRange[1];
      const tempPenalty = Math.min(25, Math.round(overTemp * 1.5));
      recommendations.push({
        type: 'temperature',
        severity: 'high',
        message: `Engine temperature ${Math.round(temperature)}°C above optimal range. Reduce load or check cooling system.`,
        efficiency: -tempPenalty
      });
      efficiencyScore = Math.max(0, efficiencyScore - tempPenalty);
    } else if (temperature < this.performanceMetrics.optimalTempRange[0]) {
      const underTemp = this.performanceMetrics.optimalTempRange[0] - temperature;
      const tempPenalty = Math.min(15, Math.round(underTemp * 1.0));
      recommendations.push({
        type: 'temperature',
        severity: 'medium',
        message: 'Engine below optimal temperature. Performance limited until warm.',
        efficiency: -tempPenalty
      });
      efficiencyScore = Math.max(0, efficiencyScore - tempPenalty);
    }

    if (rpm > this.performanceMetrics.optimalRpmRange[1]) {
      const overRev = (rpm - this.performanceMetrics.optimalRpmRange[1]) / 1000;
      const rpmPenalty = Math.min(20, Math.round(overRev * 10));
      const suggestedGear = this.getOptimalGear(speed);
      recommendations.push({
        type: 'rpm',
        severity: 'medium',
        message: `High RPM detected (${Math.round(rpm)}). Consider shifting to ${suggestedGear} for better efficiency.`,
        efficiency: -rpmPenalty
      });
      efficiencyScore = Math.max(0, efficiencyScore - rpmPenalty);
    } else if (rpm < this.performanceMetrics.optimalRpmRange[0] && speed > 20) {
      const underRev = (this.performanceMetrics.optimalRpmRange[0] - rpm) / 1000;
      const rpmPenalty = Math.min(15, Math.round(underRev * 8));
      recommendations.push({
        type: 'rpm',
        severity: 'low',
        message: `Engine RPM below optimal range (${Math.round(rpm)}). Consider downshifting for better response.`,
        efficiency: -rpmPenalty
      });
      efficiencyScore = Math.max(0, efficiencyScore - rpmPenalty);
    }

    if (currentHp > 300 && this.pedalStates.accelerator > 80) {
      const excessPower = (currentHp - 300) / 100;
      const powerPenalty = Math.min(15, Math.round(excessPower * 5));
      recommendations.push({
        type: 'power',
        severity: 'medium',
        message: `High power demand (${Math.round(currentHp)}hp). Moderate acceleration above 300hp for better efficiency.`,
        efficiency: -powerPenalty
      });
      efficiencyScore = Math.max(0, efficiencyScore - powerPenalty);
    }

    if (this.performanceMetrics.peakPowerMode) {
      efficiencyScore = Math.min(100, efficiencyScore + 15);
    }

    this.performanceMetrics.recommendations = recommendations;
    this.performanceMetrics.currentEfficiency = Math.max(0, efficiencyScore);

    return {
      efficiency: this.performanceMetrics.currentEfficiency,
      recommendations: this.performanceMetrics.recommendations,
      currentMode: this.performanceMetrics.peakPowerMode ? 'POWER' : 'EFFICIENCY',
      metrics: {
        temperature,
        rpm,
        horsepower: currentHp,
        gearEfficiency
      }
    };
  }

  updatePerformanceHistory(rpm, temperature, horsepower, fuelConsumption) {
    this.performanceHistory.rpm.push(rpm);
    this.performanceHistory.temperature.push(temperature);
    this.performanceHistory.horsepower.push(horsepower);
    this.performanceHistory.fuelConsumption.push(fuelConsumption);

    if (this.performanceHistory.rpm.length > this.performanceHistory.maxSamples) {
      this.performanceHistory.rpm.shift();
      this.performanceHistory.temperature.shift();
      this.performanceHistory.horsepower.shift();
      this.performanceHistory.fuelConsumption.shift();
    }
  }

  togglePerformanceMode() {
    this.performanceMetrics.peakPowerMode = !this.performanceMetrics.peakPowerMode;
    if (this.performanceMetrics.peakPowerMode) {
      this.performanceMetrics.optimalRpmRange = [3500, 7000];
      this.performanceMetrics.optimalTempRange = [90, 98];
    } else {
      this.performanceMetrics.optimalRpmRange = [2000, 6000];
      this.performanceMetrics.optimalTempRange = [85, 95];
    }
    return this.performanceMetrics.peakPowerMode ? 'POWER' : 'EFFICIENCY';
  }

  getPerformanceHistory() {
    return this.performanceHistory;
  }
}

export default CarDynamics