/*
Auto-generated base by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/models/try-1.glb -o src/components/Instax12.jsx -r public
Model swapped to try-1.glb. Its gltfjsx extraction is structurally identical to
the previous instaxmini12.glb (same node/mesh/material/animation names and node
transforms), so the interaction layer below — colour change, drag, hover/tap part
selection, flash glow, lens & photo animations — is unchanged and works as-is.
*/

import React from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { AdditiveBlending, CanvasTexture, LoopOnce, LoopRepeat, SRGBColorSpace } from 'three'
import { useMediaQuery } from 'react-responsive'

const TAP_MOVE_TOLERANCE = 12

// Instax "develop" effect: the print fades up from a blank cream sheet to the
// full, colour-saturated photo over a few seconds. It's drawn onto a 2D canvas
// whose CanvasTexture is the polaroid's photo map — pure canvas, no shader, so
// it's robust across GPUs.
const DEVELOP_DURATION = 3.4 // seconds

// The polaroid plane is a flat rectangle, but its UVs sample a ~20°-rotated
// rectangle of the texture, so a straight print looks like a neatly tilted card.
// The only thing that maps onto it correctly is a texture laid out exactly like
// the model's built-in print — so rather than draw our own card, we use the
// model's DEFAULT polaroid as the base layer and replace just the photo inside
// it. PHOTO_QUAD is that photo window, measured from the default texture as
// fractions of its size (a clean rotated rectangle: origin TL, edges TL->TR and
// TL->BL).
const PHOTO_QUAD = {
  tl: [0.0737, 0.2416],
  tr: [0.6207, 0.0818],
  bl: [0.3427, 0.8347],
}

const drawDevelop = (ctx, baseImg, photo, p) => {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.filter = 'none'
  // Base = the model's own default polaroid (its decoded image holds the correctly
  // laid-out, tilted card). The plane only samples the card region, so the texture's
  // transparent surround is never seen.
  ctx.clearRect(0, 0, w, h)
  if (baseImg) ctx.drawImage(baseImg, 0, 0, w, h)

  // Work in the photo window's own rotated frame so the fill + photo land squarely
  // inside it and never spill onto the white border.
  const TL = [PHOTO_QUAD.tl[0] * w, PHOTO_QUAD.tl[1] * h]
  const TR = [PHOTO_QUAD.tr[0] * w, PHOTO_QUAD.tr[1] * h]
  const BL = [PHOTO_QUAD.bl[0] * w, PHOTO_QUAD.bl[1] * h]
  const ux = TR[0] - TL[0], uy = TR[1] - TL[1]
  const vx = BL[0] - TL[0], vy = BL[1] - TL[1]
  const qw = Math.hypot(ux, uy)
  const qh = Math.hypot(vx, vy)
  const ang = Math.atan2(uy, ux)

  ctx.save()
  ctx.translate(TL[0], TL[1])
  ctx.rotate(ang)
  ctx.beginPath()
  ctx.rect(0, 0, qw, qh)
  ctx.clip()
  // Blank "undeveloped" film, covering the default photo underneath.
  ctx.fillStyle = '#e7e0d2'
  ctx.fillRect(0, 0, qw, qh)
  if (photo) {
    const ease = p * p * (3 - 2 * p) // smoothstep
    ctx.globalAlpha = ease
    // Cover-fit the square photo into the window (crop the long side), centered.
    const pw = photo.width, ph = photo.height
    const ar = qw / qh
    let sw = pw, sh = ph, sx = 0, sy = 0
    if (pw / ph > ar) { sw = ph * ar; sx = (pw - sw) / 2 }
    else { sh = pw / ar; sy = (ph - sh) / 2 }
    ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, qw, qh)
  }
  ctx.restore()
  ctx.globalAlpha = 1
}

const getPointerPoint = (event) => {
  const source = event.nativeEvent || event
  return {
    x: source.clientX ?? 0,
    y: source.clientY ?? 0,
  }
}

export function Model({ hoveredPart, setHoveredPart, onSelect, isDraggingRef, onShutterPress, photoImage = null, photoNonce = 0, interactive = true, ...props }) {
  const group = React.useRef()
  const shutterButtonRef = React.useRef()
  const flashRef = React.useRef()
  const flashGlowLightRef = React.useRef()
  const flashGlowMaterialRef = React.useRef()
  const batteryCoverRef = React.useRef()
  const wasLensHovered = React.useRef(false)
  const touchStartRef = React.useRef(null)
  // Develop-fade state for the printed photo (see drawDevelop / the print effect).
  const developRef = React.useRef({ active: false, t: 0, ctx: null, texture: null, photo: null, base: null })
  const [photoVisible, setPhotoVisible] = React.useState(false)
  const { nodes, materials, animations } = useGLTF('/models/try-1.glb')
  const { actions } = useAnimations(animations, group)
  const flashGlassMaterial = React.useMemo(() => materials['eevee glass 1'].clone(), [materials])
  const flashDoorMaterial = React.useMemo(() => materials['Material.007'].clone(), [materials])
  // Tablets use tap-to-select parts (no hover). Width clause matches the ≤1399
  // tablet range so it works even when (hover:none)/(pointer:coarse) don't fire.
  const isTouch = useMediaQuery({ query: '(hover: none), (pointer: coarse), (max-width: 1399px)' })

  const setPartHover = (part) => (e) => {
    if (!interactive) return
    e.stopPropagation()
    setHoveredPart(part)
  }

  const clearPartHover = (e) => {
    if (!interactive) return
    e.stopPropagation()
    setHoveredPart(null)
  }

  const selectPart = (part) => (e) => {
    if (!interactive) return
    e.stopPropagation()
    onSelect(part)
  }

  const playPhotoAnimation = () => {
    if (!interactive) return
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
    if (!interactive) return
    onSelect(part)

    if (part === 'shutter-button') {
      setHoveredPart('polaroid-image')
      // Open the webcam capture flow; ModelCanvas drives capture -> photoNonce,
      // which triggers the print + develop below. Fall back to the plain eject
      // animation if no handler is wired (keeps the model usable standalone).
      if (onShutterPress) onShutterPress()
      else playPhotoAnimation()
      return
    }

    setHoveredPart((prev) => (prev === part ? null : part))
  }

  const beginTouchPart = (part) => (e) => {
    if (!interactive) return
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
    if (!interactive) return
    if (!touchStartRef.current) return

    const point = getPointerPoint(e)
    const deltaX = Math.abs(point.x - touchStartRef.current.x)
    const deltaY = Math.abs(point.y - touchStartRef.current.y)

    if (deltaX > TAP_MOVE_TOLERANCE || deltaY > TAP_MOVE_TOLERANCE) {
      touchStartRef.current.didMove = true
    }
  }

  const endTouchPart = (part) => (e) => {
    if (!interactive) return
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
    if (!interactive) return
    e.stopPropagation()
    activateTouchPart('shutter-button')
  }

  const partHandlers = (part) =>
    !interactive
      ? {}
      :
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
    if (!interactive) return
    const isLensHovered = hoveredPart === 'lens'
    if (wasLensHovered.current === isLensHovered) return

    const lensClips = ['lenseAction', 'lesne1Action', 'lense2Action', 'lense2Action.001', 'lense2Action.002']
    lensClips.forEach((clip) => playClip(clip, !isLensHovered, isLensHovered))
    wasLensHovered.current = isLensHovered
  }, [hoveredPart, actions, interactive])

  // Print the captured (or default) photo: swap it onto the polaroid's photo
  // material, eject the print, and run the develop fade. Driven by photoNonce so
  // each shutter -> capture cycle re-triggers it. The print stays out afterwards
  // (no auto-hide) so the developed photo remains visible.
  React.useEffect(() => {
    if (!interactive || photoNonce <= 0) return

    const photoMat = materials['Material.004']
    if (!photoMat) {
      console.warn('Instax12: polaroid photo material (Material.004) not found; cannot print.')
    }
    if (photoMat) {
      // Remember the model's built-in default print so we can restore it on deny.
      if (photoMat.userData.defaultMap === undefined) {
        photoMat.userData.defaultMap = photoMat.map || null
      }

      // Keep the photo material in its normal lit state — defensively reset any
      // earlier experiment so a hot-reloaded session (cached material) still
      // renders the print correctly rather than from a stale emissive/unlit setup.
      photoMat.color.set('#ffffff')
      if (photoMat.emissive) photoMat.emissive.set('#000000')
      photoMat.emissiveMap = null
      photoMat.toneMapped = true
      photoMat.metalness = 0
      photoMat.roughness = 0.246
      photoMat.envMapIntensity = 1

      if (photoImage) {
        const dev = developRef.current
        // The default print texture's decoded image is our base layer — it holds
        // the correctly laid-out (tilted) card. Size the canvas to match it so the
        // measured photo quad lines up 1:1, draw the card, then develop the selfie
        // inside the photo window. The material is otherwise untouched, so the
        // result renders exactly like the built-in print, just with a new photo.
        const src = photoMat.userData.defaultMap
        const baseImg = src && src.image ? src.image : null
        if (!dev.texture) {
          const canvas = document.createElement('canvas')
          canvas.width = baseImg ? baseImg.width : 500
          canvas.height = baseImg ? baseImg.height : 623
          dev.ctx = canvas.getContext('2d')
          dev.texture = new CanvasTexture(canvas)
        }
        // Mirror the default texture's sampler settings so our canvas maps onto the
        // (tilted-UV) polaroid plane identically to the built-in print.
        if (src) {
          dev.texture.flipY = src.flipY
          dev.texture.colorSpace = src.colorSpace
          dev.texture.wrapS = src.wrapS
          dev.texture.wrapT = src.wrapT
          dev.texture.center.copy(src.center)
          dev.texture.rotation = src.rotation
          dev.texture.repeat.copy(src.repeat)
          dev.texture.offset.copy(src.offset)
        } else {
          dev.texture.flipY = false
          dev.texture.colorSpace = SRGBColorSpace
        }
        dev.base = baseImg
        dev.photo = photoImage
        dev.t = 0
        dev.active = true
        drawDevelop(dev.ctx, dev.base, dev.photo, 0)
        dev.texture.needsUpdate = true
        photoMat.map = dev.texture
      } else {
        // Permission denied / fallback: restore the model's built-in default photo.
        developRef.current.active = false
        photoMat.map = photoMat.userData.defaultMap
      }
      photoMat.needsUpdate = true
    }

    playPhotoAnimation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoNonce])

  // Free the develop CanvasTexture's GPU memory when the model unmounts.
  React.useEffect(() => {
    return () => {
      const dev = developRef.current
      if (dev.texture) {
        dev.texture.dispose()
        dev.texture = null
      }
    }
  }, [])

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
    if (!interactive) return
    let dirty = false

    // Advance the instax develop fade (redraws the print canvas each frame).
    const dev = developRef.current
    if (dev.active && dev.ctx) {
      dev.t += delta
      const p = Math.min(1, dev.t / DEVELOP_DURATION)
      drawDevelop(dev.ctx, dev.base, dev.photo, p)
      dev.texture.needsUpdate = true
      dirty = true
      if (p >= 1) dev.active = false
    }

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
          {...(!interactive
            ? {}
            : isTouch
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

useGLTF.preload('/models/try-1.glb')
