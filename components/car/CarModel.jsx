"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

useGLTF.preload("/models/scene.glb");

export function CarModel({
  modelPath = "/models/scene.glb",
  engineRunning,
  speed = 0,
  temperature = 85,
  brakePosition = 0
}) {
  const gltf = useGLTF(modelPath);
  const renderedWheelMeshesRef = useRef([]);
  const engineMeshesRef = useRef([]);
  const wheelDetectionDone = useRef(false);
  const tailLightRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, content: "", x: 0, y: 0 });
  const { camera, size } = useThree();
  const tooltipRef = useRef(null);

  const brakeLightMaterials = useMemo(() => {
    const baseRedColor = new THREE.Color(0xff0000);
    const darkRedColor = new THREE.Color(0x990000);
    
    return {
      off: new THREE.MeshPhysicalMaterial({
        color: darkRedColor,
        emissive: baseRedColor,
        emissiveIntensity: 0.15,
        roughness: 0.2,
        metalness: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.2,
        transparent: true,
        opacity: 0.9
      }),
      on: new THREE.MeshPhysicalMaterial({
        color: baseRedColor,
        emissive: baseRedColor,
        emissiveIntensity: 1.0,
        roughness: 0.1,
        metalness: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 1.0
      })
    };
  }, []);

  useEffect(() => {
    console.log("Creating tooltip element");
    if (!tooltipRef.current) {
      const div = document.createElement('div');
      div.id = 'car-part-tooltip';
      div.style.position = 'fixed';
      div.style.pointerEvents = 'none';
      div.style.zIndex = '99999';
      div.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      div.style.color = 'white';
      div.style.padding = '8px 12px';
      div.style.borderRadius = '6px';
      div.style.fontSize = '14px';
      div.style.fontFamily = 'sans-serif';
      div.style.backdropFilter = 'blur(4px)';
      div.style.border = '1px solid rgba(255, 255, 255, 0.2)';
      div.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      div.style.display = 'none';
      div.style.transition = 'all 0.1s ease-out';
      div.style.whiteSpace = 'nowrap';
      document.body.appendChild(div);
      tooltipRef.current = div;
      console.log("Tooltip element created:", div);
    }
    return () => {
      console.log("Cleaning up tooltip");
      if (tooltipRef.current) {
        document.body.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (tooltipRef.current) {
      console.log("Updating tooltip:", tooltip);
      if (tooltip.show) {
        tooltipRef.current.style.display = 'block';
        tooltipRef.current.style.left = `${tooltip.x}px`;
        tooltipRef.current.style.top = `${tooltip.y}px`;
        tooltipRef.current.textContent = tooltip.content;
      } else {
        tooltipRef.current.style.display = 'none';
      }
    }
  }, [tooltip]);

  const getTemperatureDisplay = (temp) => {
    if (temp <= 90) return `Normal (${Math.round(temp)}°C)`;
    if (temp <= 100) return `Warm (${Math.round(temp)}°C)`;
    if (temp <= 110) return `Hot (${Math.round(temp)}°C)`;
    return `Critical (${Math.round(temp)}°C)!`;
  };

  const getTooltipContent = (partName, isEnginePart) => {
    const tooltips = {
      body: "Vehicle Body - Transparent to view internal components",
      engine: `Engine Temperature: ${getTemperatureDisplay(temperature)}`,
      block: `Engine Block - ${getTemperatureDisplay(temperature)}`,
      intake: "Air Intake System",
      "sr20-det": "SR20-DET Engine",
      cabeçotes: "Engine Heads",
      "caixa_de_cambio": "Transmission Box",
      câmbio: "Gearbox System",
      pistão: "Engine Pistons",
      válvula: "Engine Valves",
      carter: "Oil Pan",
      "injeção": "Fuel Injection System",
      eletronica: "Engine Electronics",
    };

    if (isEnginePart) {
      return tooltips[partName.toLowerCase()] || `Engine Component: ${partName} - ${getTemperatureDisplay(temperature)}`;
    }
    return tooltips[partName.toLowerCase()] || partName;
  };

  const getEngineColor = useMemo(() => {
    const normalColor = new THREE.Color(0x2a2a2a);
    const warmColor = new THREE.Color(0xff6200);
    const hotColor = new THREE.Color(0xff3800);
    const criticalColor = new THREE.Color(0xff0000);
    
    return (temp) => {
      if (temp <= 90) return normalColor;
      if (temp >= 110) return criticalColor;
      
      if (temp <= 100) {
        const t = (temp - 90) / (100 - 90);
        const color = new THREE.Color();
        color.lerpColors(normalColor, hotColor, t);
        return color;
      } else {
        const t = (temp - 100) / (110 - 100);
        const color = new THREE.Color();
        color.lerpColors(hotColor, criticalColor, t);
        return color;
      }
    };
  }, []);

  const sceneClone = useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone();
  }, [gltf?.scene]);

  function handleModelRef(node) {
    if (node && !wheelDetectionDone.current) {
      console.log("Setting up model interactions");
      const wheelMeshes = [];
      const engineParts = [];

      node.traverse((child) => {
        if (child.isMesh) {
          console.log("Found mesh:", child.name);
          
          child.layers.enable(0);
          child.raycast = new THREE.Mesh().raycast;
          
          const name = child.name.toLowerCase();

          if (name === "body002" || name.includes("tail") || name.includes("brake")) {
            console.log("Found tail light:", name);
            if (!child.userData.originalMaterial) {
              child.userData.originalMaterial = child.material.clone();
            }
            child.material = brakeLightMaterials.off.clone();
            tailLightRef.current = child;
            
            child.userData.tooltipContent = "Brake Light";
          }
          else if (name.includes("wheel") || name.includes("tire")) {
            if (!child.userData.originalMaterial) {
              child.userData.originalMaterial = child.material.clone();
            }
            child.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(0x0a0a0a),
              roughness: 0.7,
              metalness: 0.1
            });
            wheelMeshes.push(child);
          }
          else if (name === "body003" || name.includes("body")) {
            if (!child.userData.originalMaterial) {
              child.userData.originalMaterial = child.material;
            }
            child.material = new THREE.MeshPhysicalMaterial({
              color: child.material.color,
              transparent: true,
              opacity: 0.4,
              roughness: 0.4,
              metalness: 0.8,
              clearcoat: 0.5,
              clearcoatRoughness: 0.1
            });

            child.userData.isBody = true;
            child.userData.tooltipContent = "Vehicle Body - Transparent to view internal components";
          }

          const enginePartNames = [
            "engine",
            "intake",
            "oilpan",
            "carter",
            "coletor",
            "admissão",
            "injeção",
            "eletronica",
            "cabeçotes",
            "caixa_de_cambio",
            "block",
            "motor",
            "bloco",
            "cabeçote",
            "pistão",
            "válvula",
            "câmbio",
            "parafusos",
            "sr20-det",
            "caixa_de_cambio",
            "câmbio",
           
           
          ];

          const isEnginePart = enginePartNames.some(part => 
            name.includes(part) || 
            name.includes(part.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
          );

          if (isEnginePart) {
            console.log("Setting up engine part:", name);
            if (!child.userData.originalMaterial) {
              child.userData.originalMaterial = child.material;
            }
            
            let material;
            if (name.includes("block") || name.includes("carter") || name.includes("bloco")) {
              material = new THREE.MeshPhysicalMaterial({
                color: getEngineColor(temperature),
                roughness: 0.5,
                metalness: 0.8,
                emissive: getEngineColor(temperature),
                emissiveIntensity: Math.max(0, (temperature - 85) / 25 * 0.6),
                clearcoat: 0.5,
                clearcoatRoughness: 0.3
              });
            } else {
              material = new THREE.MeshPhysicalMaterial({
                color: getEngineColor(temperature),
                roughness: 0.3,
                metalness: 0.9,
                emissive: getEngineColor(temperature),
                emissiveIntensity: Math.max(0, (temperature - 85) / 25 * 0.7),
                clearcoat: 0.7,
                clearcoatRoughness: 0.2
              });
            }
            
            child.material = material;
            engineParts.push(child);

            child.userData.isEnginePart = true;
            child.userData.tooltipContent = `${name} - ${getTemperatureDisplay(temperature)}`;
          }

          child.addEventListener('pointerenter', (event) => {
            console.log("Pointer enter:", child.name);
            event.stopPropagation();
            
            const vector = new THREE.Vector3();
            child.getWorldPosition(vector);
            vector.project(camera);

            const x = (vector.x * 0.5 + 0.5) * size.width;
            const y = (-(vector.y * 0.5) + 0.5) * size.height;

            console.log("Screen position:", { x, y });
            
            setTooltip({
              show: true,
              content: child.userData.tooltipContent || child.name,
              x: x + 10,
              y: y + 10
            });
            
            document.body.style.cursor = 'pointer';
          });

          child.addEventListener('pointerleave', () => {
            console.log("Pointer leave:", child.name);
            setTooltip({ show: false, content: "", x: 0, y: 0 });
            document.body.style.cursor = 'default';
          });
        }
      });

      renderedWheelMeshesRef.current = wheelMeshes;
      engineMeshesRef.current = engineParts;
      wheelDetectionDone.current = true;
      console.log("Model setup complete");
    }
  }

  useFrame(() => {
    engineMeshesRef.current.forEach(mesh => {
      if (mesh && mesh.material) {
        const color = getEngineColor(temperature);
        mesh.material.color = color;
        mesh.material.emissive = color;
        
        const name = mesh.name.toLowerCase();
        if (name.includes("block") || name.includes("carter") || name.includes("bloco")) {
          mesh.material.emissiveIntensity = Math.max(0, (temperature - 85) / 25 * 0.6);
        } else {
          mesh.material.emissiveIntensity = Math.max(0, (temperature - 85) / 25 * 0.7);
        }
      }
    });

    if (tailLightRef.current) {
      const brakeIntensity = brakePosition / 100;
      if (brakePosition > 0) {
        const material = tailLightRef.current.material;
        const t = brakeIntensity;
        
        material.color.lerpColors(
          brakeLightMaterials.off.color,
          brakeLightMaterials.on.color,
          t
        );
        
        material.emissiveIntensity = 0.15 + (t * 0.85);
        
        material.opacity = 0.9 + (t * 0.1);
        
        material.roughness = brakeLightMaterials.on.roughness;
        material.clearcoatRoughness = brakeLightMaterials.on.clearcoatRoughness;
      } else {
        const material = tailLightRef.current.material;
        material.color.copy(brakeLightMaterials.off.color);
        material.emissiveIntensity = 0.15;
        material.opacity = 0.9;
        material.roughness = brakeLightMaterials.off.roughness;
        material.clearcoatRoughness = brakeLightMaterials.off.clearcoatRoughness;
      }
    }

    if (engineRunning && speed > 0) {
      const rotationPerFrame = speed * 0.1;
      renderedWheelMeshesRef.current.forEach((wheel) => {
        wheel.rotation.x += rotationPerFrame;
      });
    }
  });

  if (!sceneClone) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-white text-2xl">Loading car model...</p>
      </div>
    );
  }

  return (
    <primitive
      ref={handleModelRef}
      object={sceneClone}
      scale={[1, 1, 1]}
      position={[0, -0.2, 0]}
      rotation={[0, Math.PI, 0]}
    />
  );
}
