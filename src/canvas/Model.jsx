import React, { Suspense, useRef } from 'react'
import { RayCastSurface } from '../helpers/RaycastOnSurface.jsx'
import Box from './Box.jsx'

export default function Model(props) {
  const group = useRef()
  return (
    <>
      <RayCastSurface elRef={group} />
      <group
        ref={group}
        {...props}
        dispose={null}
        onClick={(event) => {
          event.stopPropagation()
        }}>
        <Suspense fallback="null">
          <Box />
        </Suspense>
      </group>
    </>
  )
}
