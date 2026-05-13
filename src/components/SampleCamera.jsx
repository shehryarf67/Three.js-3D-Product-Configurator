import { useGLTF } from '@react-three/drei'
import { useRef, useEffect, useFrame, useState } from '../imports.js'
import { damp3 } from 'maath/easing'

export const SAMPLE_CAMERA_PATH = '/models/digital_rangefinder_camera/scene.gltf'

export function useSampleCameraModel() {
  return useGLTF(SAMPLE_CAMERA_PATH)
}

export function Model({
  hoveredPart,
  setHoveredPart,
  onSelect,
  ...props
}) {
  const { nodes, materials } = useSampleCameraModel()
  const bodyRef = useRef()
  const lensRef = useRef()
  const sockelRef = useRef()

  useEffect(() => {
    document.body.style.cursor = hoveredPart ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hoveredPart])

  // Set emissive colour once — avoids re-parsing the hex string on every frame.
  useEffect(() => {
    bodyRef.current?.material?.emissive?.set('#7fe8ff')
    lensRef.current?.material?.emissive?.set('#7fe8ff')
    sockelRef.current?.material?.emissive?.set('#7fe8ff')
  }, [])

  useFrame((state, delta) => {
    let dirty = false

    if (bodyRef.current?.material) {
      const target = hoveredPart === 'body' ? 0.5 : 0
      const diff = target - bodyRef.current.material.emissiveIntensity
      if (Math.abs(diff) > 0.001) {
        bodyRef.current.material.emissiveIntensity += diff * delta * 8
        dirty = true
      }
    }

    if (lensRef.current) {
      const targetScale = hoveredPart === 'lens' ? [0.16, 0.19, 0.16] : [0.128, 0.156, 0.128]
      if (Math.abs(lensRef.current.scale.x - targetScale[0]) > 0.0001) {
        damp3(lensRef.current.scale, targetScale, 0.15, delta)
        dirty = true
      }
    }

    if (lensRef.current?.material) {
      const target = hoveredPart === 'lens' ? 0.5 : 0
      const diff = target - lensRef.current.material.emissiveIntensity
      if (Math.abs(diff) > 0.001) {
        lensRef.current.material.emissiveIntensity += diff * delta * 8
        dirty = true
      }
    }

    if (sockelRef.current) {
      const targetScale = hoveredPart === 'sockel' ? [0.3, 0.27, 0.27] : [0.277, 0.247, 0.247]
      if (Math.abs(sockelRef.current.scale.x - targetScale[0]) > 0.0001) {
        damp3(sockelRef.current.scale, targetScale, 0.15, delta)
        dirty = true
      }
    }

    if (sockelRef.current?.material) {
      const target = hoveredPart === 'sockel' ? 0.5 : 0
      const diff = target - sockelRef.current.material.emissiveIntensity
      if (Math.abs(diff) > 0.001) {
        sockelRef.current.material.emissiveIntensity += diff * delta * 8
        dirty = true
      }
    }

    if (dirty) state.invalidate()
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

useGLTF.preload(SAMPLE_CAMERA_PATH)
