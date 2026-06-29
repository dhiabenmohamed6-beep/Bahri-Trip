'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface Props {
  src: string
  onDone: (dataUrl: string) => void
  onCancel: () => void
  aspectW?: number
  aspectH?: number
}

export default function ImageCropper({ src, onDone, onCancel, aspectW = 16, aspectH = 9 }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const imgRef     = useRef<HTMLImageElement | null>(null)

  const [zoom, setZoom]     = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  // canvas display size
  const CW = 560
  const CH = Math.round(CW * aspectH / aspectW)

  // draw whenever zoom/offset/src changes
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img    = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, CW, CH)

    const scale = Math.max(CW / img.naturalWidth, CH / img.naturalHeight) * zoom
    const sw = img.naturalWidth  * scale
    const sh = img.naturalHeight * scale

    // clamp offset so image always covers canvas
    const minX = CW - sw
    const minY = CH - sh
    const ox = Math.min(0, Math.max(minX, offset.x))
    const oy = Math.min(0, Math.max(minY, offset.y))

    ctx.drawImage(img, ox, oy, sw, sh)

    // grid overlay
    ctx.strokeStyle = 'rgba(255,255,255,.25)'
    ctx.lineWidth = 1
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(CW * i / 3, 0); ctx.lineTo(CW * i / 3, CH); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, CH * i / 3); ctx.lineTo(CW, CH * i / 3); ctx.stroke()
    }
  }, [zoom, offset, CW, CH])

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { imgRef.current = img; setZoom(1); setOffset({ x: 0, y: 0 }) }
    img.src = src
  }, [src])

  useEffect(() => { draw() }, [draw])

  // mouse drag
  function onMouseDown(e: React.MouseEvent) {
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return
    const dx = e.clientX - dragStart.current.mx
    const dy = e.clientY - dragStart.current.my
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy })
  }
  function onMouseUp() { setDragging(false) }

  // touch drag
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    setDragging(true)
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y }
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!dragging) return
    const t = e.touches[0]
    const dx = t.clientX - dragStart.current.mx
    const dy = t.clientY - dragStart.current.my
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy })
  }

  function handleDone() {
    const canvas = canvasRef.current
    const img    = imgRef.current
    if (!canvas || !img) return

    // render at full 1920×1080
    const out = document.createElement('canvas')
    out.width  = 1920
    out.height = Math.round(1920 * aspectH / aspectW)
    const ctx  = out.getContext('2d')!

    const scale = Math.max(CW / img.naturalWidth, CH / img.naturalHeight) * zoom
    const sw = img.naturalWidth  * scale
    const sh = img.naturalHeight * scale
    const minX = CW - sw; const minY = CH - sh
    const ox = Math.min(0, Math.max(minX, offset.x))
    const oy = Math.min(0, Math.max(minY, offset.y))

    const ratio = out.width / CW
    ctx.drawImage(img, ox * ratio, oy * ratio, sw * ratio, sh * ratio)
    onDone(out.toDataURL('image/jpeg', 0.92))
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] shadow-2xl p-6 w-full max-w-2xl" style={{ animation:'popIn .3s cubic-bezier(.34,1.56,.64,1) both' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-800">Crop & Resize Image</h3>
            <p className="text-slate-400 text-xs mt-0.5">Drag to reposition · Zoom slider to resize</p>
          </div>
          <button onClick={onCancel} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xl transition-colors">×</button>
        </div>

        {/* Canvas */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 cursor-grab active:cursor-grabbing mb-4"
          style={{ width: CW, maxWidth: '100%', aspectRatio: `${aspectW}/${aspectH}` }}>
          <canvas
            ref={canvasRef}
            width={CW} height={CH}
            className="w-full h-full block"
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
          />
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-4 mb-5">
          <span className="text-slate-400 text-sm w-10 text-center">🔍−</span>
          <input type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-cyan-500" />
          <span className="text-slate-400 text-sm w-10 text-center">🔍+</span>
          <span className="text-cyan-500 font-bold text-sm w-12 text-right">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleDone}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
            style={{ background:'linear-gradient(135deg,#06b6d4,#0891b2)' }}>
            Use This Image ✓
          </button>
        </div>
      </div>
    </div>
  )
}
