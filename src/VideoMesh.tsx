import * as React from 'react'
import { forwardRef, useMemo } from 'react'
import * as THREE from 'three'

export let VideoMesh = forwardRef(
  ({ stream, muted = false, position, size }, ref) => {
    let video = useMemo(() => {
      let video = document.createElement('video')

      video.muted = muted
      video.srcObject = stream
      video.play()

      return video
    }, [stream])

    return (
      <mesh ref={ref} position={position}>
        <boxBufferGeometry attach="geometry" args={size} />

        <meshBasicMaterial attach="material">
          <videoTexture
            key={stream.id}
            attach="map"
            format={THREE.RGBFormat}
            args={[video]}
          />
        </meshBasicMaterial>
      </mesh>
    )
  }
)
