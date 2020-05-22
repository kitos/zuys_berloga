import { render } from 'react-dom'
import * as React from 'react'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from 'react-three-fiber'
import Peer from 'peerjs'

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

let getWebcamStream = () =>
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' },
    audio: { noiseSuppression: true, echoCancellation: true },
  })

let VideoMesh = ({ stream, position, size }) => {
  let video = useMemo(() => {
    let video = document.createElement('video')

    video.srcObject = stream
    video.play()

    return video
  }, [stream])

  return (
    <mesh position={position}>
      <boxBufferGeometry attach="geometry" args={size} />

      <meshBasicMaterial attach="material">
        <videoTexture attach="map" format={THREE.RGBFormat} args={[video]} />
      </meshBasicMaterial>
    </mesh>
  )
}

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

let App = () => {
  let [webcamStream, setWebStream] = useState<
    ThenArg<ReturnType<typeof getWebcamStream>>
  >()
  let [peer, setPeer] = useState(() => {
    let p = new Peer({
      debug: new URL(location.href).searchParams.get('debug') ?? 0,
    })

    p.on('open', () => setPeer(p)) // force update

    return p
  })
  let connectToRef = useRef<HTMLInputElement>()

  let [call, setCall] = useState()
  let [incomingStream, setIncoming] = useState()

  useEffect(() => {
    if (call) {
      call.on('stream', setIncoming)
      call.on('error', (e) => console.error('Calls error:', e))
    }
  }, [call])

  useEffect(() => {
    let answer = (call) => {
      call.answer(webcamStream)
      setCall(call)
    }

    peer.on('call', answer)

    return () => peer.off('call', answer)
  }, [peer, webcamStream])

  useEffect(() => {
    getWebcamStream().then(setWebStream)
  }, [])

  return (
    <main style={{ height: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#eee',
          maxWidth: 300,
        }}
      >
        <label>
          Your id: <input value={peer.id || ''} type="text" disabled />
        </label>

        <label>
          Connect to: <input ref={connectToRef} type="text" />
        </label>

        {webcamStream ? (
          <button
            onClick={() => {
              let call = peer.call(connectToRef.current.value, webcamStream)

              setCall(call)
            }}
          >
            Connect
          </button>
        ) : (
          'Loading...'
        )}
      </div>

      <Canvas camera={{ position: [0, 0, 35] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={2} />
          <pointLight position={[40, 40, 40]} />

          <MouseRotatingGroup>
            <Text position={[0, 10, 0]}>ZUYS</Text>
            <Text position={[0, 5, 0]}>BERLOGA</Text>

            {incomingStream && (
              <VideoMesh
                stream={incomingStream}
                position={[0, -7, 0]}
                size={[25, 15, 5]}
              />
            )}
          </MouseRotatingGroup>

          {webcamStream && (
            <VideoMesh
              stream={webcamStream}
              position={[25, 25, 0]}
              size={[16, 12, 1]}
            />
          )}
        </Suspense>
      </Canvas>
    </main>
  )
}

render(<App />, document.getElementById('root'))
