import { render } from 'react-dom'
import * as React from 'react'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from 'react-three-fiber'

import { Text } from './Text'

let MouseRotatingGroup: React.FC<{}> = ({ children }) => {
  let ref = useRef()

  useEffect(() => {
    let listener = (e) => {
      let { innerWidth: windowWidth, innerHeight: windowHeight } = window

      let halfWidth = windowWidth / 2
      let halfHeight = windowHeight / 2
      ref.current.rotation.x = ((e.offsetY - halfHeight) / halfHeight) * 0.7
      ref.current.rotation.y = ((e.offsetX - halfWidth) / halfWidth) * 0.7
    }

    document.addEventListener('mousemove', listener)

    return () => document.removeEventListener('mousemove', listener)
  }, [])

  return <group ref={ref}>{children}</group>
}

let initWebcamInput = async () => {
  let stream = await navigator.mediaDevices.getUserMedia({ video: true })
  let video = document.createElement('video')

  video.srcObject = stream
  await video.play()

  return video
}

let VideoMesh = ({ video }) => (
  <mesh position={[0, -7, 0]}>
    <boxBufferGeometry attach="geometry" args={[25, 15, 5]} />

    <meshBasicMaterial attach="material">
      <videoTexture
        attach="map"
        minFilter={THREE.LinearFilter}
        magFilter={THREE.LinearFilter}
        format={THREE.RGBFormat}
        args={[video]}
      />
    </meshBasicMaterial>
  </mesh>
)

let App = () => {
  let [video, setVideo] = useState<HTMLVideoElement>()

  useEffect(() => {
    initWebcamInput().then(setVideo)
  })

  return (
    <Canvas camera={{ position: [0, 0, 35] }}>
      <Suspense fallback={null}>
        <ambientLight intensity={2} />
        <pointLight position={[40, 40, 40]} />

        <MouseRotatingGroup>
          <Text position={[0, 10, 0]}>ZUYS</Text>
          <Text position={[0, 5, 0]}>BERLOGA</Text>

          {video && <VideoMesh video={video} />}
        </MouseRotatingGroup>
      </Suspense>
    </Canvas>
  )
}

render(<App />, document.getElementById('root'))
