import { render } from 'react-dom'
import * as THREE from 'three'
import * as React from 'react'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useLoader, useUpdate } from 'react-three-fiber'

import fontBlobUrl from '../public/bold.blob'

let Text = ({
  children,
  vAlign = 'center',
  hAlign = 'center',
  size = 1,
  color = '#000000',
  ...props
}) => {
  const font = useLoader(THREE.FontLoader, fontBlobUrl)
  const config = useMemo(
    () => ({
      font,
      size: 40,
      height: 30,
      curveSegments: 32,
      bevelEnabled: true,
      bevelThickness: 6,
      bevelSize: 2.5,
      bevelOffset: 0,
      bevelSegments: 8,
    }),
    [font]
  )
  const mesh = useUpdate(
    (self) => {
      const size = new THREE.Vector3()
      self.geometry.computeBoundingBox()
      self.geometry.boundingBox.getSize(size)
      self.position.x =
        hAlign === 'center' ? -size.x / 2 : hAlign === 'right' ? 0 : -size.x
      self.position.y =
        vAlign === 'center' ? -size.y / 2 : vAlign === 'top' ? 0 : -size.y
    },
    [children]
  )
  return (
    <group {...props} scale={[0.1 * size, 0.1 * size, 0.1]}>
      <mesh ref={mesh}>
        <textGeometry attach="geometry" args={[children, config]} />
        <meshNormalMaterial attach="material" />
      </mesh>
    </group>
  )
}

let App = () => {
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

  return (
    <Canvas camera={{ position: [0, 0, 35] }}>
      <Suspense fallback={null}>
        <ambientLight intensity={2} />
        <pointLight position={[40, 40, 40]} />
        <group ref={ref}>
          <Text position={[0, 5, 0]}>ZUYS</Text>
          <Text position={[0, 0, 0]}>BERLOGA</Text>
        </group>
      </Suspense>
    </Canvas>
  )
}

render(<App />, document.getElementById('root'))
