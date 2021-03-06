import { render } from 'react-dom'
import * as React from 'react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from 'react-three-fiber'
import Peer from 'peerjs'

import { Text } from './Text'
import { DeviceSelect } from './DeviceSelect'
import { VideoMesh } from './VideoMesh'
import { MouseRotatingGroup } from './MouseRotatingGroup'

let RotatingVideo = ({ stream }) => {
  let localVideoRef = useRef()
  useFrame(() => (localVideoRef.current.rotation.y += 0.01))

  return (
    <VideoMesh
      ref={localVideoRef}
      stream={stream}
      muted
      position={[25, 15, 0]}
      size={[10, 10, 10]}
    />
  )
}

let App = () => {
  let { searchParams } = new URL(location.href)
  let [webcamStream, setWebcamStream] = useState()
  let [peer, setPeer] = useState(() => {
    let p = new Peer({
      debug: searchParams.get('debug') ?? 0,
    })

    p.on('open', () => setPeer(p)) // force update

    return p
  })
  let connectToRef = useRef<HTMLInputElement>()
  let [callTo, setCallTo] = useState(searchParams.get('callTo'))

  useEffect(() => {
    if (callTo && webcamStream) {
      let call = peer.call(callTo, webcamStream)

      setCall(call)
    }
  }, [callTo, webcamStream])

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
          Your id: <input value={peer.id || ''} type="text" disabled />{' '}
          <a href={`?callTo=${peer.id}`} target="_blank">
            Link
          </a>
        </label>

        <label>
          Connect to: <input ref={connectToRef} type="text" />
        </label>

        {webcamStream ? (
          <button onClick={() => setCallTo(connectToRef.current.value)}>
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

          {webcamStream && <RotatingVideo stream={webcamStream} />}
        </Suspense>
      </Canvas>
    </main>
  )
}

render(<App />, document.getElementById('root'))
