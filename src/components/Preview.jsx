import React, { useEffect } from 'react'

export default function Preview({ canvasRef, renderer, hasImage }) {
  useEffect(() => {
    (async () => {
      if (!canvasRef.current) return
      if (!hasImage) {
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height)
        return
      }
      await renderer.render(canvasRef.current)
    })()
  }, [renderer, canvasRef, hasImage])

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto">
      <canvas ref={canvasRef} className="max-w-full max-h-full transition" />
    </div>
  )
}

