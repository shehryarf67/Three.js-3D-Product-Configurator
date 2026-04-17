import { useGLTF } from '@react-three/drei'
import { useRef, useEffect, useFrame, useState } from '../imports.js'
import { damp3 } from 'maath/easing'

export function Model({
  hoveredPart,
  setHoveredPart,
  onSelect,
  ...props
}) {
  const { nodes, materials } = useGLTF('/models/digital_rangefinder_camera/scene.gltf')
  const bodyRef = useRef()
  const lensRef = useRef()
  const sockelRef = useRef()

  useEffect(() => {
    document.body.style.cursor = hoveredPart ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hoveredPart])

  useFrame((_, delta) => {
    if (bodyRef.current?.material?.emissive) {
      bodyRef.current.material.emissive.set('#7fe8ff')
      bodyRef.current.material.emissiveIntensity +=
        ((hoveredPart === 'body' ? 0.5 : 0) - bodyRef.current.material.emissiveIntensity) * delta * 8
    }

    if (lensRef.current) {
      damp3(
        lensRef.current.scale,
        hoveredPart === 'lens' ? [0.16, 0.19, 0.16] : [0.128, 0.156, 0.128],
        0.15,
        delta
      )
    }

    if (lensRef.current?.material?.emissive) {
      lensRef.current.material.emissive.set('#7fe8ff')
      lensRef.current.material.emissiveIntensity +=
        ((hoveredPart === 'lens' ? 0.5 : 0) - lensRef.current.material.emissiveIntensity) * delta * 8
    }

    if (sockelRef.current) {
      damp3(
        sockelRef.current.scale,
        hoveredPart === 'sockel' ? [0.3, 0.27, 0.27] : [0.277, 0.247, 0.247],
        0.15,
        delta
      )
    }

    if (sockelRef.current?.material?.emissive) {
      sockelRef.current.material.emissive.set('#7fe8ff')
      sockelRef.current.material.emissiveIntensity +=
        ((hoveredPart === 'sockel' ? 0.5 : 0) - sockelRef.current.material.emissiveIntensity) * delta * 8
    }
  })

  return (
    <group
      {...props}
      dispose={null}
    >
      <mesh
        ref={bodyRef}
        name="body"
        geometry={nodes.Object_4.geometry}
        material={materials.KameraMat}
        position={[0.001, 0.197, -0.073]}
        scale={0.243}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredPart('body')
        }}
        onPointerOut={() => setHoveredPart(null)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('body')
        }}
      />

      <mesh
        ref={lensRef}
        name="lens"
        geometry={nodes.Object_6.geometry}
        material={materials.OptiklMat}
        position={[0.234, 0.179, -0.132]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={[0.128, 0.156, 0.128]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredPart('lens')
        }}
        onPointerOut={() => setHoveredPart(null)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('lens')
        }}
      />

      <mesh
        ref={sockelRef}
        name="sockel"
        geometry={nodes.Object_8.geometry}
        material={materials.SockelMat}
        position={[0.001, 0.177, -0.069]}
        scale={[0.277, 0.247, 0.247]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredPart('sockel')
        }}
        onPointerOut={() => setHoveredPart(null)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('sockel')
        }}
      />
    </group>
  )
}

useGLTF.preload('/models/digital_rangefinder_camera/scene.gltf')
