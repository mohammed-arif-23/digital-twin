"use client";

import {
  Environment,
  PerspectiveCamera,
  Plane,
  ContactShadows,
  OrbitControls,
} from "@react-three/drei";
import { CarModel } from "./CarModel";
import { TireSmoke } from "../effects/ParticleSystem";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export function CarScene({
  engineRunning,
  speed,
  currentGear,
  viewMode = "track",
  modelPath = null,
  brakePosition = 0,
  temperature = 85,
}) {
  const groupRef = useRef();
  const trackPositionRef = useRef(0);
  const trackMarkingsRef = useRef();
  const smokeParticlesRef = useRef([]);
  const orbitControlsRef = useRef();
  const { camera } = useThree();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const cameraPositions = {
    track: [8, 1.5, 4],
    engine: [0, 1.1, -0.8],
  };

  const cameraTargets = {
    track: [0, -0.6, 0],
    engine: [0, -0.8, -0.4],
  };

  useEffect(() => {
    console.log('CarScene: viewMode changed to', viewMode);
    if (camera && cameraPositions[viewMode]) {
      console.log('CarScene: Setting camera position to', cameraPositions[viewMode]);
      setIsTransitioning(true);
      
      const targetPosition = new THREE.Vector3(...cameraPositions[viewMode]);
      const targetLookAt = new THREE.Vector3(...cameraTargets[viewMode]);
      
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = false;
      }
      
      camera.position.copy(targetPosition);
      camera.lookAt(targetLookAt);
      camera.updateMatrixWorld();
      
      console.log('CarScene: Camera position set to', camera.position);
      console.log('CarScene: Camera target set to', targetLookAt);
      
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.copy(targetLookAt);
        orbitControlsRef.current.update();
        
        setTimeout(() => {
          orbitControlsRef.current.enabled = true;
          setIsTransitioning(false);
          console.log('CarScene: Transition complete');
        }, 500);
      }
    }
  }, [viewMode, camera]);

  const createBrakeSmoke = (position, intensity, wheelSide) => {
    const geometry = new THREE.PlaneGeometry(0.8, 0.8);
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const centerX = 64;
    const centerY = 64;
    const gradient1 = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      50
    );
    gradient1.addColorStop(0, "rgba(120, 120, 120, 0.9)");
    gradient1.addColorStop(0.4, "rgba(90, 90, 90, 0.7)");
    gradient1.addColorStop(0.8, "rgba(60, 60, 60, 0.4)");
    gradient1.addColorStop(1, "rgba(30, 30, 30, 0)");
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const radius = Math.random() * 15 + 5;
      const opacity = Math.random() * 0.3;
      const noiseGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      noiseGradient.addColorStop(0, `rgba(100, 100, 100, ${opacity})`);
      noiseGradient.addColorStop(1, "rgba(100, 100, 100, 0)");
      ctx.fillStyle = noiseGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.6 * intensity,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.position.y += 0.1;
    mesh.position.x += (Math.random() - 0.5) * 0.2;
    mesh.position.z += (Math.random() - 0.5) * 0.2;
    mesh.rotation.z = Math.random() * Math.PI * 2;
    const particle = {
      mesh,
      velocity: {
        x: (Math.random() - 0.5) * 0.5 + (wheelSide === "left" ? -0.2 : 0.2),
        y: 0.3 + Math.random() * 0.4,
        z: -0.5 + Math.random() * 0.3,
      },
      angularVelocity: (Math.random() - 0.5) * 1.5,
      life: 3 + Math.random() * 2,
      maxLife: 3 + Math.random() * 2,
      initialScale: 0.5 + Math.random() * 0.3,
      maxScale: 2.5 + Math.random() * 1.5,
    };
    return particle;
  };

  useFrame((state, delta) => {
    if (groupRef.current && engineRunning && speed > 0) {
      const isReverse = currentGear === "R";
      const direction = isReverse ? -1 : 1;
      const speedMS = (speed * 1.60934) / 3.6;
      trackPositionRef.current += speedMS * delta * direction;
      if (trackMarkingsRef.current) {
        trackMarkingsRef.current.position.z = trackPositionRef.current;
        const resetDistance = 5;
        if (trackPositionRef.current > resetDistance) {
          trackPositionRef.current -= resetDistance;
        } else if (trackPositionRef.current < -resetDistance) {
          trackPositionRef.current += resetDistance;
        }
      }
      const vibration = Math.sin(state.clock.elapsedTime * 20) * 0.001;
      groupRef.current.position.y = vibration;
      const tilt = Math.min(speed * 0.0002, 0.01);
      groupRef.current.rotation.x = isReverse ? tilt : -tilt;
    }
    const shouldGenerateSmoke = brakePosition > 40 && speed > 50;
    if (shouldGenerateSmoke && Math.random() < 0.4) {
      const smokeIntensity = Math.min((brakePosition / 100) * (speed / 80), 1);
      const wheelData = [
        {
          pos: new THREE.Vector3(-0.6, -0.8, 1.2),
          side: "left",
          intensity: smokeIntensity * 0.3,
          },
        {
          pos: new THREE.Vector3(0.6, -0.8, 1.2),
          side: "right",
          intensity: smokeIntensity * 0.3,
        },
        {
          pos: new THREE.Vector3(-0.6, -0.8, -1.2),
          side: "left",
          intensity: smokeIntensity * 1.5,
        },
        {
          pos: new THREE.Vector3(0.6, -0.8, -1.2),
          side: "right",
          intensity: smokeIntensity * 1.5,
        },
      ];
      wheelData.forEach((wheel) => {
        if (Math.random() < wheel.intensity) {
          const particle = createBrakeSmoke(
            wheel.pos,
            wheel.intensity,
            wheel.side
          );
          smokeParticlesRef.current.push(particle);
          groupRef.current?.add(particle.mesh);
        }
      });
    }
    smokeParticlesRef.current.forEach((particle, index) => {
      if (particle.mesh) {
        particle.mesh.position.y += particle.velocity.y * delta;
        particle.mesh.position.z += particle.velocity.z * delta;
        particle.mesh.position.x += particle.velocity.x * delta;
        particle.velocity.x *= 0.985;
        particle.velocity.z *= 0.985;
        particle.velocity.y *= 0.92;
        particle.mesh.rotation.z += particle.angularVelocity * delta;
        particle.life -= delta;
        const lifeRatio = particle.life / particle.maxLife;
        const opacity = Math.max(0, Math.pow(lifeRatio, 0.7));
        particle.mesh.material.opacity = opacity * 0.7;
        const expansionRatio = 1 - lifeRatio;
        const scale =
          particle.initialScale +
          expansionRatio * (particle.maxScale - particle.initialScale);
        particle.mesh.scale.setScalar(scale);
        particle.mesh.lookAt(state.camera.position);
        if (particle.life <= 0) {
          if (particle.mesh.parent) {
            particle.mesh.parent.remove(particle.mesh);
          }
          particle.mesh.material.map?.dispose();
          particle.mesh.material.dispose();
          particle.mesh.geometry.dispose();
          smokeParticlesRef.current.splice(index, 1);
        }
      }
    });
  });

  return (
    <>
      <Environment preset={viewMode === "track" ? "dawn" : "sunset"} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[15, 10, 8]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <pointLight
        position={[-6, 3, -6]}
        intensity={0.8}
        color="#ffffff"
        distance={20}
      />
      {engineRunning && (
        <>
          <pointLight
            position={[0, 0.8, 1.5]}
            intensity={0.4}
            color="#ff6b35"
            distance={6}
          />
          {temperature > 100 && (
            <pointLight
              position={[0, 0.5, -0.5]}
              intensity={Math.min((temperature - 100) / 10 * 0.5, 1)}
              color="#ff0000"
              distance={3}
            />
          )}
        </>
      )}
      <PerspectiveCamera
        makeDefault
        position={cameraPositions[viewMode]}
        fov={viewMode === "engine" ? 65 : 60}
      />
      <group ref={groupRef} position={[0, 0, 0]}>
        <CarModel
          modelPath={modelPath || "/models/scene.glb"}
          engineRunning={engineRunning}
          speed={speed}
          temperature={temperature}
          brakePosition={brakePosition}
        />
        {brakePosition > 40 && speed > 50 && (
          <>
            <TireSmoke
              active={true}
              intensity={Math.min((brakePosition / 100) * (speed / 80), 1)}
              position={new THREE.Vector3(-0.6, -0.8, -1.2)}
              side="left"
            />
            <TireSmoke
              active={true}
              intensity={Math.min((brakePosition / 100) * (speed / 80), 1)}
              position={new THREE.Vector3(0.6, -0.8, -1.2)}
              side="right"
            />
          </>
        )}
      </group>
      <Plane
        args={[100, 100]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.25, 0]}
      >
        <meshPhysicalMaterial
          color={viewMode === "track" ? "#1a1a1a" : "#2a2a2a"}
          roughness={viewMode === "track" ? 0.9 : 0.8}
          metalness={viewMode === "track" ? 0.1 : 0.0}
        />
      </Plane>
      {viewMode === "track" && (
        <group ref={trackMarkingsRef}>
          {Array.from({ length: 40 }, (_, i) => (
            <Plane
              key={`yellow-${i}`}
              args={[0.3, 2]}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.24, -50 + i * 2.5]}
            >
              <meshBasicMaterial color="#ffff00" />
            </Plane>
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <group key={`sidelines-${i}`}>
              <Plane
                args={[0.15, 10]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[5, -0.24, -50 + i * 10]}
              >
                <meshBasicMaterial color="#ffffff" />
              </Plane>
              <Plane
                args={[0.15, 10]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[-5, -0.24, -50 + i * 10]}
              >
                <meshBasicMaterial color="#ffffff" />
              </Plane>
            </group>
          ))}
        </group>
      )}
      <ContactShadows
        position={[0, -0.49, 0]}
        opacity={0.6}
        scale={15}
        blur={2}
        far={20}
      />
      <OrbitControls
        ref={orbitControlsRef}
        enablePan={!isTransitioning}
        enableZoom={!isTransitioning}
        enableRotate={!isTransitioning}
        minDistance={viewMode === "engine" ? 1.0 : 8}
        maxDistance={viewMode === "engine" ? 4.0 : 25}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={0}
        target={cameraTargets[viewMode]}
        dampingFactor={0.05}
        enableDamping={true}
      />
    </>
  );
}
