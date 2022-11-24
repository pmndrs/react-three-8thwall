import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import useStore from '../helpers/store'
import Model from './Model'
import fragment from '../shaders/shaderCamera'

const App8thWall = (props) => {
  const { scene, camera } = props
  const set = useThree((state) => state.set)

  // ref to root of our ThreeJS app
  const appRef = useRef()

  // add our app to 8thWall's ThreeJS scene
  useEffect(() => {
    if (scene) {
      scene.add(appRef.current)
    }
  }, [scene])

  // set 8thWall's ThreeJS camera as default camera of
  // react-three-fiber
  useEffect(() => {
    if (camera) {
      set({
        camera: camera,
      })
    }
  }, [camera, set])

  // useCameraPostProcess()

  return (
    <>
      <group ref={appRef} visible={true}>
        <Model />
      </group>
    </>
  )
}

const XRAvailable = () => {
  const { scene, camera, renderer } = window.XR8.Threejs.xrScene()

  window.XR8.XrController.updateCameraProjectionMatrix({
    origin: camera.position,
    facing: camera.quaternion,
  })

  return <App8thWall scene={scene} camera={camera} gl={renderer} />
}

const CanvasComp = () => {
  const ref = useRef(null)
  const [xr8Ready, setxr8Ready] = useState(false)
  const dom = useStore((s) => s.dom)

  let canvasEl = document.getElementsByTagName('canvas')[0]

  useLayoutEffect(() => {
    const spamTryStart = setInterval(() => {
      const { XR8, XRExtras } = window
      // console.log(XR8)
      if (XR8 && !xr8Ready) {
        clearInterval(spamTryStart)

        XR8.GlTextureRenderer.configure({
          fragmentSource: fragment,
        }) // postprocess

        window.THREE = THREE
        XR8.addCameraPipelineModules([
          XR8.GlTextureRenderer.pipelineModule(), // Draws the camera feed.
          XR8.Threejs.pipelineModule(), // Creates a ThreeJS AR Scene.
          XR8.XrController.pipelineModule(), // Enables SLAM tracking.
          XR8.CanvasScreenshot.pipelineModule(),
          XRExtras.AlmostThere.pipelineModule(), // Detects unsupported browsers and gives hints.
          XRExtras.FullWindowCanvas.pipelineModule(), // Modifies the canvas to fill the window.
          XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
          XRExtras.RuntimeError.pipelineModule(), // Shows an error image on runtime error.

          // Custom pipeline modules.
        ])
        XR8.addCameraPipelineModule({
          name: 'callbackmount',
          onStart: () => {
            console.log('isLOADED!')
            setxr8Ready(true)
          },
        })
        XR8.XrController.configure({ enableLighting: false, enableWorldPoints: false, disableWorldTracking: false })
        XR8.run({ canvas: canvasEl, webgl2: false })
      }
    }, 100)
  }, [])

  return (
    <Canvas
      linear
      ref={ref}
      id={'r3fcanvas'}
      domElement={canvasEl}
      onCreated={(state) => {
        state.events.connect(dom.current)
      }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}>
      {xr8Ready && <XRAvailable />}
    </Canvas>
  )
}

export default CanvasComp
