import { render } from 'react-dom'
import * as React from 'react'
import { Suspense, useEffect, useRef } from 'react'
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

let App = () => {
  return (
    <Canvas camera={{ position: [0, 0, 35] }}>
      <Suspense fallback={null}>
        <ambientLight intensity={2} />
        <pointLight position={[40, 40, 40]} />

        <MouseRotatingGroup>
          <Text position={[0, 5, 0]}>ZUYS</Text>
          <Text position={[0, 0, 0]}>BERLOGA</Text>
        </MouseRotatingGroup>
      </Suspense>
    </Canvas>
  )
}

render(<App />, document.getElementById('root'))
