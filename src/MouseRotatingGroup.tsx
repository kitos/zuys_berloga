import * as React from 'react'
import { useEffect, useRef } from 'react'

export let MouseRotatingGroup: React.FC<{}> = ({ children }) => {
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
