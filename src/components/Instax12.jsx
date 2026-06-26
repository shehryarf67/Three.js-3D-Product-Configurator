/*
Auto-generated base by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/models/INSTAX_FINAL.glb -o src/components/Instax12.jsx -r public
Model swapped to INSTAX_FINAL.glb (finalized model). Node/mesh accessor names are
the same as the previous try-1.glb EXCEPT renamed materials and the polaroid mesh:
  • body/lens material  'pastel blue' + 'screws'  ->  'BASE_TEXTURE'
  • polaroid photo plane 'Plane005'/'Material.004' -> 'Plane'/'POLAROID_1'
  • polaroid frame        'Plane005_1'/'Material.005' -> 'Plane_1'/'POLAROID_2' (+ 'Plane_2'/'POLAROID_3' back)
  • eject animation       'Plane.001Action.001'  ->  'POLAROID ACTION'
The interaction layer below — colour change, drag, hover/tap part selection, flash
glow, lens & photo animations — is otherwise unchanged. (The new model ships an
extra animation we deliberately don't drive yet.)
*/

import React from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useAnimations, useGLTF } from '@react-three/drei'
import { AdditiveBlending, Box3, CanvasTexture, Euler, LoopOnce, Quaternion, SRGBColorSpace, Vector3 } from 'three'
import { useMediaQuery } from 'react-responsive'

const TAP_MOVE_TOLERANCE = 12

// On-canvas close button placement, as multiples of the polaroid's half-size from
// its centre (+x = right, +y = up). Tune these to move the ✕ — they're applied in
// the JSX, so edits take effect on hot-reload without re-entering viewing mode.
const CLOSE_BTN_MX = 1.25
const CLOSE_BTN_MY = 1.15

// Lens "extend" clips. The full clip is an out-and-back (rest -> fully extended at
// the MIDPOINT -> rest), so on hover/select we drive each clip to its midpoint and
// HOLD it there (lens fully extended, no looping); on un-hover we play forward to
// the end (back to rest). Holding at the midpoint also lets the demand render loop
// go idle instead of spinning a looping clip forever (a real battery/heat win).
const LENS_CLIPS = ['lenseAction', 'lesne1Action', 'lense2Action', 'lense2Action.001', 'lense2Action.002']

// Instax "develop" effect: the print fades up from a blank cream sheet to the
// full, colour-saturated photo over a few seconds. It's drawn onto a 2D canvas
// whose CanvasTexture is the polaroid's photo map — pure canvas, no shader, so
// it's robust across GPUs.
const DEVELOP_DURATION = 3.4 // seconds

// On INSTAX_FINAL.glb the photo is its OWN plane (material POLAROID_1) whose UVs
// map cleanly to the full 0..1 texture, with the white frame on a separate plane
// (POLAROID_2). So printing is simple: draw the selfie to fill the whole canvas
// and cross-fade it up from a blank cream sheet — no tilted-window compositing,
// no base-card layer (the frame lives on its own mesh and is untouched).
const drawDevelop = (ctx, photo, p) => {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.filter = 'none'
  ctx.clearRect(0, 0, w, h)
  // Blank "undeveloped" film.
  ctx.fillStyle = '#e7e0d2'
  ctx.fillRect(0, 0, w, h)
  if (photo) {
    const ease = p * p * (3 - 2 * p) // smoothstep
    ctx.globalAlpha = ease
    // Cover-fit the photo into the plane (crop the long side), centered.
    const pw = photo.width, ph = photo.height
    const ar = w / h
    let sw = pw, sh = ph, sx = 0, sy = 0
    if (pw / ph > ar) { sw = ph * ar; sx = (pw - sw) / 2 }
    else { sh = pw / ar; sy = (ph - sh) / 2 }
    ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, w, h)
  }
  ctx.globalAlpha = 1
}

const getPointerPoint = (event) => {
  const source = event.nativeEvent || event
  return {
    x: source.clientX ?? 0,
    y: source.clientY ?? 0,
  }
}

export function Model({
  hoveredPart,
  setHoveredPart,
  onSelect,
  isDraggingRef,
  onShutterPress,
  photoImage = null,
  photoNonce = 0,
  interactive = true,
  // Polaroid present/view flow (driven by ModelCanvas):
  //   'idle'      -> camera only, polaroid hidden
  //   'ejecting'  -> polaroid prints/ejects out of the (still visible) camera
  //   'viewing'   -> camera hidden, polaroid alone, free to rotate in place
  //   'returning' -> camera back, polaroid retracts into it
  polaroidPhase = 'idle',
  polaroidRotXRef,
  polaroidRotYRef,
  onEjectDone,
  onReturnDone,
  onPolaroidClose,
  onDefaultImage,
  ...props
}) {
  const group = React.useRef()
  const shutterButtonRef = React.useRef()
  const flashRef = React.useRef()
  const flashGlowLightRef = React.useRef()
  const flashGlowMaterialRef = React.useRef()
  const batteryCoverRef = React.useRef()
  const polaroidRef = React.useRef()
  const wasLensHovered = React.useRef(false)
  const touchStartRef = React.useRef(null)
  // Develop-fade state for the printed photo (see drawDevelop / the print effect).
  const developRef = React.useRef({ active: false, pending: false, t: 0, ctx: null, texture: null, photo: null })
  // Manual polaroid-rotation state for 'viewing' mode. When active we take the
  // polaroid away from the animation mixer and spin it rigidly about its own
  // bbox centre (captured once, in the model root's local space).
  const viewRef = React.useRef({ active: false, center: null, pePos: null, peQuat: null })
  const polRotCurRef = React.useRef({ x: 0, y: 0 })
  const phaseRef = React.useRef('idle')
  // Guards the eject/return "animation finished" callback so it fires once.
  const doneFiredRef = React.useRef(false)
  const [photoVisible, setPhotoVisible] = React.useState(false)
  const [cameraVisible, setCameraVisible] = React.useState(true)
  // Polaroid centre + half-extent (parent space) captured when entering 'viewing'.
  // The close button's <Html> offset from this is applied in the JSX (CLOSE_BTN_*),
  // so the button tracks the polaroid and its offset stays hot-reload tunable.
  const [polaroidBtnAnchor, setPolaroidBtnAnchor] = React.useState(null)
  const { nodes, materials, animations } = useGLTF('/models/INSTAX_FINAL.glb')
  const { actions } = useAnimations(animations, group)
  const { camera, invalidate } = useThree()
  const flashGlassMaterial = React.useMemo(() => materials['eevee glass 1'].clone(), [materials])
  const flashDoorMaterial = React.useMemo(() => materials['Material.007'].clone(), [materials])
  // Tablets use tap-to-select parts (no hover). Width clause matches the ≤1399
  // tablet range so it works even when (hover:none)/(pointer:coarse) don't fire.
  // Touch vs mouse by INPUT capability, not width (landscape tablets at desktop
  // widths still get tap-to-select; mice keep hover). Mirrors ModelCanvas.jsx.
  const isTouch = useMediaQuery({ query: '(hover: none), (pointer: coarse)' })

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

  // Play the polaroid eject clip forward (out of the camera) or reversed (back in).
  const runEject = (reversed = false) => {
    const action = actions['POLAROID ACTION']
    if (!action) return
    const dur = action.getClip().duration
    action.enabled = true
    action.paused = false
    action.clampWhenFinished = true
    action.setLoop(LoopOnce, 1)
    action.setEffectiveWeight(1)
    action.timeScale = reversed ? -1 : 1
    action.time = reversed ? dur : 0
    action.play()
  }

  const playPhotoAnimation = () => {
    if (!interactive) return
    // Standalone fallback (no ModelCanvas phase wiring): just show + eject.
    setPhotoVisible(true)
    const action = actions['POLAROID ACTION']
    if (action) action.reset()
    runEject(false)
  }

  const activateTouchPart = (part) => {
    if (!interactive) return
    onSelect(part)

    if (part === 'shutter-button') {
      setHoveredPart('polaroid-image')
      // Open the webcam capture flow; ModelCanvas drives capture -> photoNonce
      // (texture only) and, on "Done", the eject + view phases below. Fall back to
      // the plain eject animation if no handler is wired (standalone use).
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

  React.useEffect(() => {
    if (!interactive) return
    const isLensHovered = hoveredPart === 'lens'
    if (wasLensHovered.current === isLensHovered) return
    wasLensHovered.current = isLensHovered

    LENS_CLIPS.forEach((name) => {
      const action = actions[name]
      if (!action) return
      const dur = action.getClip().duration
      const mid = dur / 2
      const EPS = 1e-3
      action.enabled = true
      action.clampWhenFinished = true
      action.setLoop(LoopOnce, 1)      // never loop
      action.setEffectiveWeight(1)
      action.paused = false

      if (isLensHovered) {
        // Extend to the midpoint (fully-extended pose) and hold. From rest (either
        // clip end) start a clean first-half extend; from a partial pose, move
        // toward the midpoint from whichever side we're on.
        if (action.time >= dur - EPS || action.time <= EPS) {
          action.time = 0
          action.timeScale = 1
        } else {
          action.timeScale = action.time <= mid ? 1 : -1
        }
      } else {
        // Finish the clip forward to the end (back to rest); clampWhenFinished stops it.
        action.timeScale = 1
      }
      action.play()
    })
    invalidate() // kick the demand loop so the mixer starts advancing
  }, [hoveredPart, actions, interactive, invalidate])

  // Print the captured (or default) photo: swap it onto the polaroid's photo
  // material, eject the print, and run the develop fade. Driven by photoNonce so
  // each shutter -> capture cycle re-triggers it. The print stays out afterwards
  // (no auto-hide) so the developed photo remains visible.
  React.useEffect(() => {
    if (!interactive || photoNonce <= 0) return

    const photoMat = materials.POLAROID_1
    if (!photoMat) {
      console.warn('Instax12: polaroid photo material (POLAROID_1) not found; cannot print.')
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
        // The develop CanvasTexture is re-uploaded to the GPU every frame for the
        // full develop fade, so its size is a per-frame cost. The on-screen photo
        // plane is small, so we cap the canvas at 512px on the long side: ~4× less
        // texture-upload bandwidth per frame (the cause of the laggy/slow eject on
        // mobile), with no visible quality loss. The SAVED photo is unaffected — it
        // uses the separate full-res capture canvas (composePolaroid), not this.
        const src = photoMat.userData.defaultMap
        if (!dev.texture) {
          dev.ctx = document.createElement('canvas').getContext('2d')
          dev.texture = new CanvasTexture(dev.ctx.canvas)
        }
        const srcW = photoImage.width || 744
        const srcH = photoImage.height || 1024
        const devScale = Math.min(1, 512 / Math.max(srcW, srcH))
        dev.ctx.canvas.width = Math.round(srcW * devScale)
        dev.ctx.canvas.height = Math.round(srcH * devScale)
        // Mirror the default photo texture's sampler settings so our canvas maps onto
        // the polaroid photo plane identically to the built-in print.
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
        dev.photo = photoImage
        dev.t = 0
        // Draw the blank cream sheet now, but DON'T start the fade yet — it begins
        // when the polaroid ejects (see the 'ejecting' phase) so the develop plays
        // on screen rather than while the polaroid is still hidden.
        dev.active = false
        dev.pending = true
        drawDevelop(dev.ctx, dev.photo, 0)
        dev.texture.needsUpdate = true
        photoMat.map = dev.texture
      } else {
        // Permission denied / fallback: restore the model's built-in default photo.
        developRef.current.active = false
        developRef.current.pending = false
        photoMat.map = photoMat.userData.defaultMap
        // Surface the default photo's source image so the viewing-mode Save button
        // can download it too (there's no captured canvas in the default case).
        onDefaultImage?.(photoMat.userData.defaultMap?.image || null)
      }
      photoMat.needsUpdate = true
    }
    // NOTE: no eject here — capture only stages the texture. The eject + view
    // sequence is driven by the polaroidPhase effect below once the user hits Done.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoNonce])

  // Drive the polaroid present/view phases. ModelCanvas owns the phase state; this
  // effect turns each transition into the right animation / visibility / control.
  React.useEffect(() => {
    if (!interactive) return
    phaseRef.current = polaroidPhase
    const action = actions['POLAROID ACTION']
    if (polaroidPhase !== 'viewing') setPolaroidBtnAnchor(null)

    if (polaroidPhase === 'ejecting') {
      // Camera visible, polaroid prints out. (Texture already staged via photoNonce.)
      viewRef.current.active = false
      polRotCurRef.current = { x: 0, y: 0 }
      if (polaroidRotXRef) polaroidRotXRef.current = 0
      if (polaroidRotYRef) polaroidRotYRef.current = 0
      setCameraVisible(true)
      setPhotoVisible(true)
      // Kick off the develop fade staged at capture, now that it's on screen.
      const dev = developRef.current
      if (dev.pending && dev.ctx) {
        dev.t = 0
        dev.active = true
        dev.pending = false
      }
      doneFiredRef.current = false
      if (action) action.reset()
      runEject(false)
    } else if (polaroidPhase === 'viewing') {
      // Eject finished: hide the camera and hand the polaroid to manual rotation.
      setCameraVisible(false)
      setPhotoVisible(true)
      const pol = polaroidRef.current
      if (pol && pol.parent) {
        pol.updateWorldMatrix(true, true)
        const box = new Box3().setFromObject(pol)
        const centerW = box.getCenter(new Vector3())
        const sizeW = box.getSize(new Vector3())
        // Polaroid bbox centre, in the polaroid's PARENT space (same space as
        // pol.position) so the rigid spin about it in useFrame is exact.
        const centerL = pol.parent.worldToLocal(centerW.clone())
        // Centre the polaroid in the camera's view: a point straight ahead of the
        // camera (screen centre), at the same distance the ejected polaroid was, so
        // it keeps its size but sits dead-centre instead of wherever the eject ended.
        const fwd = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
        const dist = camera.position.distanceTo(centerW)
        const targetW = camera.position.clone().add(fwd.multiplyScalar(dist))
        const targetCenterL = pol.parent.worldToLocal(targetW)
        viewRef.current = {
          active: true,
          center: centerL,
          targetCenter: targetCenterL,
          pePos: pol.position.clone(),
          peQuat: pol.quaternion.clone(),
        }
        // Close-button anchor: store the (re-centred) polaroid centre + half-extent
        // in PARENT space. The actual offset is applied in the JSX (CLOSE_BTN_*) so
        // it's hot-reload tunable. Convert a world corner to local for the half-extent.
        const halfCornerL = pol.parent.worldToLocal(
          centerW.clone().add(new Vector3(sizeW.x * 0.5, sizeW.y * 0.5, 0))
        )
        setPolaroidBtnAnchor({
          cx: targetCenterL.x,
          cy: targetCenterL.y,
          cz: targetCenterL.z,
          hx: halfCornerL.x - centerL.x,
          hy: halfCornerL.y - centerL.y,
        })
        // Take the polaroid away from the mixer so our manual transform sticks.
        if (action) action.enabled = false
      }
    } else if (polaroidPhase === 'returning') {
      // Snap rotation back to the ejected pose, give control back to the mixer,
      // show the camera, then retract the polaroid into it (reverse clip).
      setCameraVisible(true)
      const pol = polaroidRef.current
      const v = viewRef.current
      if (pol && v.pePos) {
        pol.position.copy(v.pePos)
        pol.quaternion.copy(v.peQuat)
      }
      viewRef.current.active = false
      polRotCurRef.current = { x: 0, y: 0 }
      if (polaroidRotXRef) polaroidRotXRef.current = 0
      if (polaroidRotYRef) polaroidRotYRef.current = 0
      doneFiredRef.current = false
      if (action) action.enabled = true
      runEject(true)
    } else {
      // idle: everything back to normal, polaroid hidden.
      viewRef.current.active = false
      setCameraVisible(true)
      setPhotoVisible(false)
      if (action) {
        action.stop()
        action.enabled = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polaroidPhase])

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
      drawDevelop(dev.ctx, dev.photo, p)
      dev.texture.needsUpdate = true
      dirty = true
      if (p >= 1) dev.active = false
    }

    // Manual polaroid rotation ('viewing' mode): spin the card rigidly about its
    // own captured centre, lerping toward the drag targets. The mixer no longer
    // touches the polaroid here, so these writes stick.
    const view = viewRef.current
    if (view.active && polaroidRef.current) {
      const tx = polaroidRotXRef ? polaroidRotXRef.current : 0
      const ty = polaroidRotYRef ? polaroidRotYRef.current : 0
      const cur = polRotCurRef.current
      const s = Math.min(1, delta * 9)
      cur.x += (tx - cur.x) * s
      cur.y += (ty - cur.y) * s
      const R = new Quaternion().setFromEuler(new Euler(cur.x, cur.y, 0))
      // Spin rigidly about the polaroid's centre, but place that centre at the
      // re-centred target so the card sits dead-centre in view while it rotates.
      const rel = view.pePos.clone().sub(view.center).applyQuaternion(R)
      polaroidRef.current.position.copy(view.targetCenter || view.center).add(rel)
      polaroidRef.current.quaternion.copy(R).multiply(view.peQuat)
      if (Math.abs(tx - cur.x) > 0.0002 || Math.abs(ty - cur.y) > 0.0002) dirty = true
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

    // Lens: while hovered/selected, stop each extend clip at its MIDPOINT (fully
    // extended) and hold it there. Without this the clip would run its full
    // out-and-back; pausing at the midpoint also lets the loop go idle (no more
    // continuously-rendering looping clip). On un-hover the effect resumes it
    // forward to the end, so we only clamp while hovered.
    if (hoveredPart === 'lens') {
      for (const name of LENS_CLIPS) {
        const a = actions[name]
        if (!a || a.paused || !a.isRunning()) continue
        const mid = a.getClip().duration / 2
        const reachedMid = a.timeScale >= 0 ? a.time >= mid : a.time <= mid
        if (reachedMid) {
          a.time = mid
          a.paused = true
        }
      }
    }

    Object.values(actions).forEach((action) => {
      if (action.isRunning()) dirty = true
    })

    // Advance the polaroid phase machine when the eject / retract clip clamps.
    // (Checking the clamped clip time is more reliable than the mixer 'finished'
    // event for reverse playback.)
    const ph = phaseRef.current
    if ((ph === 'ejecting' || ph === 'returning') && !doneFiredRef.current) {
      const ejectAction = actions['POLAROID ACTION']
      if (ejectAction) {
        const dur = ejectAction.getClip().duration
        const finished =
          ph === 'ejecting' ? ejectAction.time >= dur - 1e-3 : ejectAction.time <= 1e-3
        if (finished) {
          doneFiredRef.current = true
          dirty = true
          if (ph === 'ejecting') onEjectDone?.()
          else onReturnDone?.()
        }
      }
    }

    if (dirty) state.invalidate()
  })

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        {/* Every camera mesh is parented here (mirrors the GLB's "MAIN BODY"
            parenting); the polaroid is a sibling outside it. 'viewing' mode hides
            this whole group in one toggle so only the polaroid remains on screen. */}
        <group name="CAMERA" visible={cameraVisible}>
        <mesh name="Object_7" geometry={nodes.Object_7.geometry} material={materials.metal} position={[-1.685, -0.861, 0.18]} rotation={[0, 0.518, 0]} scale={[0.558, 0.504, 0.558]} />
        <mesh name="Object_7001" geometry={nodes.Object_7001.geometry} material={materials.metal} position={[-1.685, -0.861, -0.407]} rotation={[0, 0.433, 0]} scale={[-0.558, -0.504, -0.558]} />
        <mesh name="Object_8" geometry={nodes.Object_8.geometry} material={materials.Ikae} position={[-1.685, -0.861, 0.18]} rotation={[0, 0.518, 0]} scale={[0.558, 0.504, 0.558]} />
        <mesh name="Object_8001" geometry={nodes.Object_8001.geometry} material={materials.Ikae} position={[-1.685, -0.861, -0.407]} rotation={[0, 0.433, 0]} scale={[-0.558, -0.504, -0.558]} />
        {/* IMPORTANT: the GLB has TWO materials both named "BASE_TEXTURE":
            • the MAIN BODY's (samples base colour + normal map on UV1), and
            • the other body parts' (lens, buttons, battery, …) on UV0.
            drei's `materials` dict can only key one per name and keeps the FIRST
            traversed — the body's UV1 one — so any mesh using `materials.BASE_TEXTURE`
            sampled UV1. The UV0-only parts don't have a UV1 set, so their base
            texture AND their normal-map decals (e.g. the lens-ring "INSTAX LENSE
            60mm" relief) collapsed to a single texel = the missing decals.
            Fix: bind each mesh to its ORIGINAL material via `nodes.<name>.material`
            so every part keeps the exact material + UV channel the GLB authored
            (matching Blender / glTF viewers). The colour picker still tints both,
            since both originals are named "BASE_TEXTURE". */}
        <group name="MAIN_BODY" {...partHandlers('body')}>
          <mesh name="mesh005" geometry={nodes.mesh005.geometry} material={nodes.mesh005.material} />
          <mesh name="mesh005_1" geometry={nodes.mesh005_1.geometry} material={materials['Material.001']} />
          <mesh name="mesh005_2" geometry={nodes.mesh005_2.geometry} material={materials['Material.003']} />
          <mesh name="mesh005_3" geometry={nodes.mesh005_3.geometry} material={nodes.mesh005_3.material} />
        </group>
        <mesh
          ref={shutterButtonRef}
          name="button_2"
          geometry={nodes.button_2.geometry}
          material={nodes.button_2.material}
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
          <mesh name="lense" geometry={nodes.lense.geometry} material={nodes.lense.material} position={[0.502, -0.475, 1.319]} />
          <mesh name="lesne1" geometry={nodes.lesne1.geometry} material={nodes.lesne1.material} position={[0.502, -0.475, 1.319]} />
          <group name="lense2" position={[0.502, -0.475, 1.319]}>
            <mesh name="Cylinder003" geometry={nodes.Cylinder003.geometry} material={nodes.Cylinder003.material} />
            <mesh name="Cylinder003_1" geometry={nodes.Cylinder003_1.geometry} material={materials['Material.001']} />
            <mesh name="Cylinder003_2" geometry={nodes.Cylinder003_2.geometry} material={materials['Material.002']} />
            <mesh name="lenselid_1" geometry={nodes.lenselid_1.geometry} material={materials['Material.001']} position={[0, 0, 0.094]} />
            <mesh name="lenselid_2" geometry={nodes.lenselid_2.geometry} material={materials['Material.001']} position={[0, 0, 0.094]} />
            <mesh name="lense_ref" geometry={nodes.lense_ref.geometry} material={materials['Material.003']} position={[0, 0, -0.22]} />
          </group>
          <group name="lensebody" position={[0.502, -0.475, 1.319]}>
            <mesh name="Cylinder004" geometry={nodes.Cylinder004.geometry} material={nodes.Cylinder004.material} />
            <mesh name="Cylinder004_1" geometry={nodes.Cylinder004_1.geometry} material={materials.Material} />
          </group>
        </group>
        <group name="Retopo_MAIN_BODY001">
          <mesh name="mesh011" geometry={nodes.mesh011.geometry} material={nodes.mesh011.material} />
          <mesh name="mesh011_1" geometry={nodes.mesh011_1.geometry} material={materials['Material.003']} />
        </group>
        <mesh name="Cube001" geometry={nodes.Cube001.geometry} material={nodes.Cube001.material} position={[0.639, 1.899, -0.639]} />
        <group name="BATTERY_COVER_GROUP" {...partHandlers('battery-cover')}>
          <mesh name="BATTERY_COVER_HITAREA" geometry={nodes.BATTERY_COVER.geometry} position={[-1.989, -1.081, -0.151]}>
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <group position={[-1.989, -1.081, -0.151]}>
            <group ref={batteryCoverRef} name="BATTERY_COVER">
              <mesh name="BATTERY_COVER_MESH" geometry={nodes.BATTERY_COVER.geometry} material={nodes.BATTERY_COVER.material} />
              <mesh name="BATTERY_COVER001" geometry={nodes.BATTERY_COVER001.geometry} material={materials['Material.001']} position={[-0.014, 0, 0]} />
            </group>
          </group>
        </group>
        <mesh name="Cube004" geometry={nodes.Cube004.geometry} material={nodes.Cube004.material} position={[0.387, 2.397, 0]} />
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
        </group>
        <group
          ref={polaroidRef}
          name="POLAROID"
          visible={photoVisible}
          {...partHandlers('polaroid-image')}
        >
          <mesh name="Plane" geometry={nodes.Plane.geometry} material={materials.POLAROID_1} />
          <mesh name="Plane_1" geometry={nodes.Plane_1.geometry} material={materials.POLAROID_2} />
          <mesh name="Plane_2" geometry={nodes.Plane_2.geometry} material={materials.POLAROID_3} />
        </group>
        {/* On-canvas close button anchored beside the polaroid (a sibling, so it
            doesn't spin with the card). Offset = centre + half-extent × CLOSE_BTN_*.
            Retracts the polaroid + brings the camera back. */}
        {polaroidPhase === 'viewing' && polaroidBtnAnchor && (
          <Html
            position={[
              polaroidBtnAnchor.cx + polaroidBtnAnchor.hx * CLOSE_BTN_MX,
              polaroidBtnAnchor.cy + polaroidBtnAnchor.hy * CLOSE_BTN_MY,
              polaroidBtnAnchor.cz,
            ]}
            center
            zIndexRange={[50, 0]}
            style={{ pointerEvents: 'auto' }}
          >
            <button
              type="button"
              className="polaroid-view-close"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onPolaroidClose}
              aria-label="Close polaroid and bring the camera back"
            >
              ✕
            </button>
          </Html>
        )}
      </group>
    </group>
  )
}

useGLTF.preload('/models/INSTAX_FINAL.glb')
