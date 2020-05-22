import { render } from 'react-dom'
import * as React from 'react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from 'react-three-fiber'
import Peer from 'peerjs'

import { Text } from './Text'
import { DeviceSelect } from './DeviceSelect'
import { VideoMesh } from './VideoMesh'
import { MouseRotatingGroup } from './MouseRotatingGroup'

let App = () => {
  let [webcamStream, setWebcamStream] = useState()
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

  return (
    <main style={{ height: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#eee',
          maxWidth: 400,
        }}
      >
        <DeviceSelect onChange={setWebcamStream} />

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
              muted
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
