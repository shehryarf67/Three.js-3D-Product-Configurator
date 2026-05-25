/*
Auto-generated base by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/models/instaxmini12.glb -o src/components/Instax12.jsx -r public
Interaction layer adapted from the previous Instax12 component.
*/

import React from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { AdditiveBlending, LoopOnce, LoopRepeat } from 'three'
import { useMediaQuery } from 'react-responsive'

const TAP_MOVE_TOLERANCE = 12

const getPointerPoint = (event) => {
  const source = event.nativeEvent || event
  return {
    x: source.clientX ?? 0,
    y: source.clientY ?? 0,
  }
}

export function Model({ hoveredPart, setHoveredPart, onSelect, isDraggingRef, ...props }) {
  const group = React.useRef()
  const shutterButtonRef = React.useRef()
  const flashRef = React.useRef()
  const flashGlowLightRef = React.useRef()
  const flashGlowMaterialRef = React.useRef()
  const batteryCoverRef = React.useRef()
  const wasLensHovered = React.useRef(false)
  const touchStartRef = React.useRef(null)
  const [photoVisible, setPhotoVisible] = React.useState(false)
  const { nodes, materials, animations } = useGLTF('/models/instaxmini12.glb')
  const { actions, mixer } = useAnimations(animations, group)
  const flashGlassMaterial = React.useMemo(() => materials['eevee glass 1'].clone(), [materials])
  const flashDoorMaterial = React.useMemo(() => materials['Material.007'].clone(), [materials])
  const isTouch = useMediaQuery({ query: '(hover: none), (pointer: coarse)' })

  const setPartHover = (part) => (e) => {
    e.stopPropagation()
    setHoveredPart(part)
  }

  const clearPartHover = (e) => {
    e.stopPropagation()
    setHoveredPart(null)
  }

  const selectPart = (part) => (e) => {
    e.stopPropagation()
    onSelect(part)
  }

  const playPhotoAnimation = () => {
    const action = actions['Plane.001Action.001']
    if (!action) return

    setPhotoVisible(true)
    action.stop()
    action.reset()
    action.paused = false
    action.enabled = true
    action.clampWhenFinished = true
    action.setLoop(LoopOnce, 1)
    action.timeScale = 1
    action.setEffectiveWeight(1)
    action.play()
  }

  const activateTouchPart = (part) => {
    onSelect(part)

    if (part === 'shutter-button') {
      setHoveredPart('polaroid-image')
      playPhotoAnimation()
      return
    }

    setHoveredPart((prev) => (prev === part ? null : part))
  }

  const beginTouchPart = (part) => (e) => {
    e.stopPropagation()
    const point = getPointerPoint(e)
    touchStartRef.current = {
      part,
      x: point.x,
      y: point.y,
      didMove: false,
    }
  }

  const moveTouchPart = (e) => {
    if (!touchStartRef.current) return

    const point = getPointerPoint(e)
    const deltaX = Math.abs(point.x - touchStartRef.current.x)
    const deltaY = Math.abs(point.y - touchStartRef.current.y)

    if (deltaX > TAP_MOVE_TOLERANCE || deltaY > TAP_MOVE_TOLERANCE) {
      touchStartRef.current.didMove = true
    }
  }

  const endTouchPart = (part) => (e) => {
    e.stopPropagation()
    const touchStart = touchStartRef.current
    touchStartRef.current = null

    if (!touchStart || touchStart.part !== part) return
    if (touchStart.didMove || isDraggingRef?.current) return

    activateTouchPart(part)
  }

  const cancelTouchPart = () => {
    touchStartRef.current = null
  }

  const pressShutter = (e) => {
    e.stopPropagation()
    activateTouchPart('shutter-button')
  }

  const partHandlers = (part) =>
    isTouch
      ? {
          onPointerDown: beginTouchPart(part),
          onPointerMove: moveTouchPart,
          onPointerUp: endTouchPart(part),
          onPointerCancel: cancelTouchPart,
        }
      : {
          onClick: selectPart(part),
          onPointerOver: setPartHover(part),
          onPointerLeave: clearPartHover,
        }

  const playClip = (name, reversed = false, repeat = false) => {
    const action = actions[name]
    if (!action) return

    action.paused = false
    action.enabled = true
    action.clampWhenFinished = !repeat
    action.setLoop(repeat ? LoopRepeat : LoopOnce, repeat ? Infinity : 1)
    action.timeScale = reversed ? -1 : 1

    if (reversed) {
      if (action.time <= 0) {
        action.time = action.getClip().duration
      }
      action.play()
    } else {
      if (action.time >= action.getClip().duration) {
        action.time = 0
      }
      action.play()
    }
  }

  React.useEffect(() => {
    const isLensHovered = hoveredPart === 'lens'
    if (wasLensHovered.current === isLensHovered) return

    const lensClips = ['lenseAction', 'lesne1Action', 'lense2Action', 'lense2Action.001', 'lense2Action.002']
    lensClips.forEach((clip) => playClip(clip, !isLensHovered, isLensHovered))
    wasLensHovered.current = isLensHovered
  }, [hoveredPart, actions])

  React.useEffect(() => {
    const handleFinished = (e) => {
      if (e.action.getClip().name === 'Plane.001Action.001') {
        setPhotoVisible(false)
      }
    }

    mixer.addEventListener('finished', handleFinished)
    return () => mixer.removeEventListener('finished', handleFinished)
  }, [mixer])

  React.useEffect(() => {
    if (!flashGlassMaterial.emissive) return
    flashGlassMaterial.emissive.set('#fff4c7')
    flashGlassMaterial.emissiveIntensity = 0
  }, [flashGlassMaterial])

  React.useEffect(() => {
    if (!flashDoorMaterial.emissive) return
    flashDoorMaterial.emissive.set('#fff4c7')
    flashDoorMaterial.emissiveIntensity = 0
  }, [flashDoorMaterial])

  useFrame((state, delta) => {
    let dirty = false

    if (shutterButtonRef.current) {
      const targetZ = hoveredPart === 'shutter-button' ? 0.9 : 0.944
      const diff = targetZ - shutterButtonRef.current.position.z

      if (Math.abs(diff) > 0.001) {
        shutterButtonRef.current.position.z += diff * delta * 12
        dirty = true
      }
    }

    if (batteryCoverRef.current) {
      const targetY = hoveredPart === 'battery-cover' ? -0.18 : 0
      const diff = targetY - batteryCoverRef.current.position.y

      if (Math.abs(diff) > 0.001) {
        batteryCoverRef.current.position.y += diff * delta * 8
        dirty = true
      }
    }

    if (flashRef.current) {
      const targetScale = hoveredPart === 'flashlight' ? 1.16 : 1
      const diff = targetScale - flashRef.current.scale.x

      if (Math.abs(diff) > 0.001) {
        flashRef.current.scale.x += diff * delta * 8
        flashRef.current.scale.y += diff * delta * 8
        flashRef.current.scale.z += diff * delta * 8
        dirty = true
      }
    }

    if (flashDoorMaterial.emissive) {
      const targetIntensity = hoveredPart === 'flashlight' ? 1.2 : 0
      const diff = targetIntensity - flashDoorMaterial.emissiveIntensity

      if (Math.abs(diff) > 0.01) {
        flashDoorMaterial.emissiveIntensity += diff * delta * 8
        dirty = true
      }
    }

    if (flashGlowLightRef.current) {
      const targetIntensity = hoveredPart === 'flashlight' ? 2.4 : 0
      const diff = targetIntensity - flashGlowLightRef.current.intensity

      if (Math.abs(diff) > 0.01) {
        flashGlowLightRef.current.intensity += diff * delta * 8
        dirty = true
      }
    }

    if (flashGlowMaterialRef.current) {
      const targetOpacity = hoveredPart === 'flashlight' ? 0.35 : 0
      const diff = targetOpacity - flashGlowMaterialRef.current.opacity

      if (Math.abs(diff) > 0.001) {
        flashGlowMaterialRef.current.opacity += diff * delta * 8
        dirty = true
      }
    }

    if (flashGlassMaterial.emissive) {
      const targetIntensity = hoveredPart === 'flashlight' ? 1.6 : 0
      const diff = targetIntensity - flashGlassMaterial.emissiveIntensity

      if (Math.abs(diff) > 0.01) {
        flashGlassMaterial.emissiveIntensity += diff * delta * 8
        dirty = true
      }
    }

    Object.values(actions).forEach((action) => {
      if (action.isRunning()) dirty = true
    })

    if (dirty) state.invalidate()
  })

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <mesh name="Object_7" geometry={nodes.Object_7.geometry} material={materials.metal} position={[-1.685, -0.861, 0.18]} rotation={[0, 0.518, 0]} scale={[0.558, 0.504, 0.558]} />
        <mesh name="Object_7001" geometry={nodes.Object_7001.geometry} material={materials.metal} position={[-1.685, -0.861, -0.407]} rotation={[0, 0.433, 0]} scale={[-0.558, -0.504, -0.558]} />
        <mesh name="Object_8" geometry={nodes.Object_8.geometry} material={materials.Ikae} position={[-1.685, -0.861, 0.18]} rotation={[0, 0.518, 0]} scale={[0.558, 0.504, 0.558]} />
        <mesh name="Object_8001" geometry={nodes.Object_8001.geometry} material={materials.Ikae} position={[-1.685, -0.861, -0.407]} rotation={[0, 0.433, 0]} scale={[-0.558, -0.504, -0.558]} />
        <group name="MAIN_BODY" {...partHandlers('body')}>
          <mesh name="mesh005" geometry={nodes.mesh005.geometry} material={materials['pastel blue']} />
          <mesh name="mesh005_1" geometry={nodes.mesh005_1.geometry} material={materials['Material.001']} />
          <mesh name="mesh005_2" geometry={nodes.mesh005_2.geometry} material={materials['Material.003']} />
          <mesh name="mesh005_3" geometry={nodes.mesh005_3.geometry} material={materials.screws} />
        </group>
        <mesh
          ref={shutterButtonRef}
          name="button_2"
          geometry={nodes.button_2.geometry}
          material={materials['pastel blue']}
          position={[-1.524, 0.341, 0.944]}
          {...(isTouch
            ? {
                onPointerDown: beginTouchPart('shutter-button'),
                onPointerMove: moveTouchPart,
                onPointerUp: endTouchPart('shutter-button'),
                onPointerCancel: cancelTouchPart,
              }
            : {
                onPointerDown: pressShutter,
                onPointerOver: setPartHover('shutter-button'),
                onPointerLeave: clearPartHover,
              })}
        />
        <group name="flash">
          <mesh name="Cube003" geometry={nodes.Cube003.geometry} material={flashGlassMaterial} />
          <mesh name="Cube003_1" geometry={nodes.Cube003_1.geometry} material={materials['eevee glass 1.001']} />
        </group>
        <group name="LENS" {...partHandlers('lens')}>
          <mesh name="lense" geometry={nodes.lense.geometry} material={materials['pastel blue']} position={[0.502, -0.475, 1.319]} />
          <mesh name="lesne1" geometry={nodes.lesne1.geometry} material={materials['pastel blue']} position={[0.502, -0.475, 1.319]} />
          <group name="lense2" position={[0.502, -0.475, 1.319]}>
            <mesh name="Cylinder003" geometry={nodes.Cylinder003.geometry} material={materials['pastel blue']} />
            <mesh name="Cylinder003_1" geometry={nodes.Cylinder003_1.geometry} material={materials['Material.001']} />
            <mesh name="Cylinder003_2" geometry={nodes.Cylinder003_2.geometry} material={materials['Material.002']} />
            <mesh name="lenselid_1" geometry={nodes.lenselid_1.geometry} material={materials['Material.001']} position={[0, 0, 0.094]} />
            <mesh name="lenselid_2" geometry={nodes.lenselid_2.geometry} material={materials['Material.001']} position={[0, 0, 0.094]} />
            <mesh name="lense_ref" geometry={nodes.lense_ref.geometry} material={materials['Material.003']} position={[0, 0, -0.22]} />
          </group>
          <group name="lensebody" position={[0.502, -0.475, 1.319]}>
            <mesh name="Cylinder004" geometry={nodes.Cylinder004.geometry} material={materials['pastel blue']} />
            <mesh name="Cylinder004_1" geometry={nodes.Cylinder004_1.geometry} material={materials.Material} />
          </group>
        </group>
        <group name="Retopo_MAIN_BODY001">
          <mesh name="mesh011" geometry={nodes.mesh011.geometry} material={materials['pastel blue']} />
          <mesh name="mesh011_1" geometry={nodes.mesh011_1.geometry} material={materials['Material.003']} />
        </group>
        <mesh name="Cube001" geometry={nodes.Cube001.geometry} material={materials['pastel blue']} position={[0.639, 1.899, -0.639]} />
        <group name="BATTERY_COVER_GROUP" {...partHandlers('battery-cover')}>
          <mesh name="BATTERY_COVER_HITAREA" geometry={nodes.BATTERY_COVER.geometry} position={[-1.989, -1.081, -0.151]}>
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <group position={[-1.989, -1.081, -0.151]}>
            <group ref={batteryCoverRef} name="BATTERY_COVER">
              <mesh name="BATTERY_COVER_MESH" geometry={nodes.BATTERY_COVER.geometry} material={materials['pastel blue']} />
              <mesh name="BATTERY_COVER001" geometry={nodes.BATTERY_COVER001.geometry} material={materials['Material.001']} position={[-0.014, 0, 0]} />
            </group>
          </group>
        </group>
        <mesh name="Cube004" geometry={nodes.Cube004.geometry} material={materials['pastel blue']} position={[0.387, 2.397, 0]} />
        <group
          ref={flashRef}
          name="FLASHLIGHT"
          position={[-0.649, 1.546, 0.806]}
          scale={0.924}
          {...partHandlers('flashlight')}
        >
          <mesh name="Cube010" geometry={nodes.Cube010.geometry} material={flashDoorMaterial} />
          <mesh name="Cube010_1" geometry={nodes.Cube010_1.geometry} material={materials['Material.002']} />
          <mesh name="Cube010_2" geometry={nodes.Cube010_2.geometry} material={flashGlassMaterial} />
          <mesh name="flash_rod" geometry={nodes.flash_rod.geometry} material={flashGlassMaterial} scale={[1, 1.155, 1]} />
          <pointLight ref={flashGlowLightRef} color="#fff4c7" intensity={0} distance={2.2} decay={2} />
          <mesh position={[0, 0, 0.08]} scale={[0.55, 0.82, 0.12]}>
            <sphereGeometry args={[0.45, 24, 12]} />
            <meshBasicMaterial ref={flashGlowMaterialRef} color="#fff4c7" transparent opacity={0} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
        </group>
        <group
          name="Polaroid"
          visible={photoVisible}
          {...partHandlers('polaroid-image')}
        >
          <mesh name="Plane005" geometry={nodes.Plane005.geometry} material={materials['Material.004']} />
          <mesh name="Plane005_1" geometry={nodes.Plane005_1.geometry} material={materials['Material.005']} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/instaxmini12.glb')
