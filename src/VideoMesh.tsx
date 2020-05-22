import * as React from 'react'
import { useMemo } from 'react'
import * as THREE from 'three'

export let VideoMesh = ({ stream, position, size }) => {
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
