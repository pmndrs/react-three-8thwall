import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { AttachRaycastOnSurface } from '../helpers/RaycastOnSurface'

const Box = () => {
  const refBox = useRef(null)

  useFrame((_, delta) => {
    refBox.current.rotation.x = refBox.current.rotation.y += delta
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight intensity={2} position={[4, 10, 4]} />
      <AttachRaycastOnSurface position={[0, 0, -3]}>
        <group ref={refBox} onClick={() => {}}>
          <mesh>
            <boxBufferGeometry />
            <meshPhysicalMaterial transparent depthWrite={false} side={THREE.FrontSide} />
          </mesh>
        </group>
      </AttachRaycastOnSurface>
    </>
  )
}

export default Box
