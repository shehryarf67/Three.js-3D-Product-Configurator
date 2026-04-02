import { useGLTF } from '@react-three/drei'
import { useRef, useEffect, useState, useFrame } from '../imports.js'
import { damp3 } from 'maath/easing'

export function Model({
  onLensEnter,
  onLensLeave,
  isLensHovered,
  onSockelEnter,
  onSockelLeave,
  isSockelHovered,
  onSelect,
  ...props
}) {
  const { nodes, materials } = useGLTF('/models/digital_rangefinder_camera/scene.gltf')

  const lensRef = useRef()
  const sockelRef = useRef()
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  useFrame((_, delta) => {
    if (lensRef.current) {
      damp3(
        lensRef.current.scale,
        isLensHovered ? [0.16, 0.19, 0.16] : [0.128, 0.156, 0.128],
        0.15,
        delta
      )
    }

    if (sockelRef.current) {
      damp3(
        sockelRef.current.scale,
        isSockelHovered ? [0.3, 0.27, 0.27] : [0.277, 0.247, 0.247],
        0.15,
        delta
      )
    }
  })

  return (
    <group
      {...props}
      dispose={null}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <mesh
        name="body"
        geometry={nodes.Object_4.geometry}
        material={materials.KameraMat}
        position={[0.001, 0.197, -0.073]}
        scale={0.243}
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
        onPointerEnter={onLensEnter}
        onPointerLeave={onLensLeave}
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
        onPointerEnter={onSockelEnter}
        onPointerLeave={onSockelLeave}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('sockel')
        }}
      />
    </group>
  )
}

useGLTF.preload('/models/digital_rangefinder_camera/scene.gltf')
