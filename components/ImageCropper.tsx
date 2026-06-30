'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface Props {
  src: string
  onDone: (dataUrl: string) => void
  onCancel: () => void
  aspectW?: number
  aspectH?: number
}

export default function ImageCropper({ src, onDone, onCancel, aspectW = 1, aspectH = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  const maxDisplayW = 560
  const maxDisplayH = 420

  function draw() {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const targetRatio = aspectW / aspectH
    const imgRatio = img.naturalWidth / img.naturalHeight
    let cw, ch
    if (imgRatio > targetRatio) {
      cw = Math.min(img.naturalWidth, maxDisplayW)
      ch = cw / targetRatio
    } else {
      ch = Math.min(img.naturalHeight, maxDisplayH)
      cw = ch * targetRatio
    }

    canvas.width = cw
    canvas.height = ch
    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(img, 0, 0, cw, ch)
  }

  useEffect(() => {
    setImageLoaded(false)
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setImageLoaded(true)
    }
    img.onerror = () => console.error('Failed to load image:', src)
    img.src = src
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  useEffect(() => {
    if (imageLoaded) draw()
  }, [imageLoaded])

  function handleDone() {
    const canvas = canvasRef.current
    if (canvas) {
      onDone(canvas.toDataURL('image/jpeg', 0.9))
    } else {
      onDone(src)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-[28px] shadow-2xl p-6 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-[#1e3a4c]">Adjust Photo</h3>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#1e3a4c]/60 text-lg">×</button>
        </div>

        <div className="flex justify-center rounded-2xl overflow-hidden bg-slate-100 min-h-[200px]">
          {!imageLoaded && (
            <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">Loading image...</div>
          )}
          <canvas ref={canvasRef} className={`${imageLoaded ? 'block' : 'hidden'} max-w-full h-auto`} />
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-[#1e3a4c] bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={handleDone} className="flex-1 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90" style={{ background:'linear-gradient(135deg,#06b6d4,#2d8a9e)' }}>Save</button>
        </div>
      </div>
    </div>
  )
}
