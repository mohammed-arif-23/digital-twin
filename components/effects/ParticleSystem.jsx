"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function ExhaustSmoke({ engineRunning, rpm, position }) {
  const particlesRef = useRef()
  const particles = useRef([])
  
  const particleCount = 50
  const positions = useMemo(() => new Float32Array(particleCount * 3), [])
  const opacities = useMemo(() => new Float32Array(particleCount), [])
  const sizes = useMemo(() => new Float32Array(particleCount), [])
  
  useFrame((state, delta) => {
    if (!engineRunning || rpm < 1000) return
    
    const intensity = Math.min(rpm / 8000, 1)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      if (particles.current[i]) {
        particles.current[i].life -= delta
        particles.current[i].position.y += particles.current[i].velocity.y * delta
        particles.current[i].position.x += particles.current[i].velocity.x * delta
        particles.current[i].position.z += particles.current[i].velocity.z * delta
        
        positions[i3] = particles.current[i].position.x
        positions[i3 + 1] = particles.current[i].position.y
        positions[i3 + 2] = particles.current[i].position.z
        
        opacities[i] = Math.max(0, particles.current[i].life / particles.current[i].maxLife) * 0.3
        sizes[i] = (1 - particles.current[i].life / particles.current[i].maxLife) * 2 + 0.5
        
        if (particles.current[i].life <= 0) {
          particles.current[i] = null
        }
      }
      
      if (!particles.current[i] && Math.random() < intensity * 0.1) {
        particles.current[i] = {
          position: {
            x: position.x + (Math.random() - 0.5) * 0.2,
            y: position.y,
            z: position.z + (Math.random() - 0.5) * 0.1
          },
          velocity: {
            x: (Math.random() - 0.5) * 0.5,
            y: 0.5 + Math.random() * 0.5,
            z: -1 - Math.random() * 0.5
          },
          life: 2 + Math.random() * 2,
          maxLife: 2 + Math.random() * 2
        }
      }
    }
    
    if (particlesRef.current) {
      particlesRef.current.geometry.attributes.position.needsUpdate = true
      particlesRef.current.geometry.attributes.opacity.needsUpdate = true
      particlesRef.current.geometry.attributes.size.needsUpdate = true
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={particleCount}
          array={opacities}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        transparent
        opacity={0.6}
        color="#444444"
        sizeAttenuation
        vertexColors={false}
      />
    </points>
  )
}

export function TireSmoke({ active, intensity, position, side }) {
  const smokeRef = useRef()
  const particles = useRef([])
  
  useFrame((state, delta) => {
    if (!active || intensity < 0.3) return
    
    if (Math.random() < intensity * 0.3) {
      const newParticle = {
        mesh: new THREE.Mesh(
          new THREE.PlaneGeometry(0.5, 0.5),
          new THREE.MeshBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.7 * intensity
          })
        ),
        velocity: {
          x: (Math.random() - 0.5) * 1.0 + (side === 'left' ? -0.3 : 0.3),
          y: 0.4 + Math.random() * 0.6,
          z: -0.3 + Math.random() * 0.6
        },
        life: 2 + Math.random() * 1.5,
        maxLife: 2 + Math.random() * 1.5,
        initialScale: 0.3 + Math.random() * 0.2
      }
      
      newParticle.mesh.position.copy(position)
      newParticle.mesh.position.y += 0.1
      particles.current.push(newParticle)
      
      if (smokeRef.current) {
        smokeRef.current.add(newParticle.mesh)
      }
    }
    
    particles.current.forEach((particle, index) => {
      particle.mesh.position.y += particle.velocity.y * delta
      particle.mesh.position.x += particle.velocity.x * delta
      particle.mesh.position.z += particle.velocity.z * delta
      
      particle.velocity.x *= 0.98
      particle.velocity.z *= 0.98
      particle.velocity.y *= 0.95
      
      particle.life -= delta
      const lifeRatio = particle.life / particle.maxLife
      particle.mesh.material.opacity = lifeRatio * 0.6
      
      const scale = particle.initialScale + (1 - lifeRatio) * 1.5
      particle.mesh.scale.setScalar(scale)
      
      particle.mesh.lookAt(state.camera.position)
      
      if (particle.life <= 0) {
        if (smokeRef.current) {
          smokeRef.current.remove(particle.mesh)
        }
        particle.mesh.material.dispose()
        particle.mesh.geometry.dispose()
        particles.current.splice(index, 1)
      }
    })
  })
  
  return <group ref={smokeRef} />
}