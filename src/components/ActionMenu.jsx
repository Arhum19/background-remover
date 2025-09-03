import React, { useState } from 'react'
import { removeBackgroundFromBlob } from '../lib/bgRemove.js'

export default function ActionMenu({ hasImage, onApply, busy, setBusy }) {
  const [bgColor, setBgColor] = useState('#000000')
  const [resizePreset, setResizePreset] = useState('')
  const [customW, setCustomW] = useState('')
  const [customH, setCustomH] = useState('')
  const [filter, setFilter] = useState('')
  const [watermark, setWatermark] = useState('')
  const [roundCrop, setRoundCrop] = useState(false)
  const [overlayImage, setOverlayImage] = useState(null)

  const presets = [
    { key: '1:1', label: '1:1 (Square)', type: 'ratio', value: 1 },
    { key: 'ig-pfp', label: 'Instagram PFP 320x320', type: 'fixed', w: 320, h: 320 },
    { key: 'ig-post', label: 'Instagram Post 1080x1080', type: 'fixed', w: 1080, h: 1080 },
    { key: 'li-banner', label: 'LinkedIn Banner 1584x396', type: 'fixed', w: 1584, h: 396 },
  ]

  const onRemoveBackground = async () => {
    try {
      setBusy(true)
      // Ask user which image to send to the API: use current preview raster to blob
      const canvas = document.querySelector('canvas')
      const blob = await new Promise((resolve)=> canvas.toBlob(resolve, 'image/png'))
      const resultBlob = await removeBackgroundFromBlob(blob)
      if (resultBlob) {
        const bmp = await createImageBitmap(resultBlob)
        await onApply({ type: 'replace-image', imageBitmap: bmp })
      }
    } finally {
      setBusy(false)
    }
  }

  const onOverlayUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const bmp = await createImageBitmap(file)
    setOverlayImage(bmp)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">What do you want to do?</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="btn-ghost" disabled={!hasImage || busy} onClick={onRemoveBackground}>Remove background (API)</button>
        <button className="btn-ghost" disabled={!hasImage} onClick={()=>onApply({ type: 'bg-color', color: bgColor })}>Replace bg with color</button>
        <button className="btn-ghost" disabled={!hasImage || !overlayImage} onClick={()=>onApply({ type: 'bg-image', imageBitmap: overlayImage })}>Replace bg with image</button>
        <label className="btn-ghost cursor-pointer">Upload bg image<input type="file" accept="image/*" onChange={onOverlayUpload} className="hidden" /></label>
        <button className="btn-ghost" disabled={!hasImage} onClick={()=>onApply({ type: 'compress' })}>Compress image</button>
        <button className="btn-ghost" disabled={!hasImage} onClick={()=>onApply({ type: 'convert', format: 'png' })}>Convert → PNG</button>
        <button className="btn-ghost" disabled={!hasImage} onClick={()=>onApply({ type: 'convert', format: 'jpg' })}>Convert → JPG</button>
        <button className="btn-ghost" disabled={!hasImage} onClick={()=>onApply({ type: 'convert', format: 'webp' })}>Convert → WebP</button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm w-36">Background color</label>
          <input type="color" value={bgColor} onChange={(e)=>setBgColor(e.target.value)} />
          <input type="text" value={bgColor} onChange={(e)=>setBgColor(e.target.value)} className="border rounded px-2 py-1 w-28" placeholder="#000000" />
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={()=>setBgColor('#000000')}>Black</button>
            <button className="btn-ghost" onClick={()=>setBgColor('#ffffff')}>White</button>
            <button className="btn-ghost" onClick={()=>setBgColor('#2563eb')}>Blue</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm w-36">Resize/Crop</label>
          <select value={resizePreset} onChange={(e)=>setResizePreset(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Select preset</option>
            {presets.map(p=> <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <input placeholder="Custom width" className="border rounded px-2 py-1 w-28" value={customW} onChange={(e)=>setCustomW(e.target.value)} />
          <input placeholder="Custom height" className="border rounded px-2 py-1 w-28" value={customH} onChange={(e)=>setCustomH(e.target.value)} />
          <button className="btn-ghost" disabled={!hasImage && !resizePreset && !customW} onClick={()=>{
            if (resizePreset) {
              const p = presets.find(x=>x.key===resizePreset)
              if (!p) return
              if (p.type==='fixed') onApply({ type: 'resize', width: p.w, height: p.h })
              if (p.type==='ratio') onApply({ type: 'crop-ratio', ratio: p.value })
            } else if (customW || customH) {
              const w = customW ? parseInt(customW,10) : undefined
              const h = customH ? parseInt(customH,10) : undefined
              onApply({ type: 'resize', width: w, height: h })
            }
          }}>Apply</button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm w-36">Filters</label>
          <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Select</option>
            <option value="grayscale">Grayscale</option>
            <option value="sepia">Sepia</option>
            <option value="blur">Blur</option>
            <option value="brightness">Brightness</option>
            <option value="contrast">Contrast</option>
          </select>
          <button className="btn-ghost" disabled={!hasImage || !filter} onClick={()=>onApply({ type: 'filter', name: filter })}>Apply filter</button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm w-36">Watermark/Text</label>
          <input className="border rounded px-2 py-1 flex-1" placeholder="Your text" value={watermark} onChange={(e)=>setWatermark(e.target.value)} />
          <button className="btn-ghost" disabled={!hasImage || !watermark} onClick={()=>onApply({ type: 'watermark', text: watermark })}>Add</button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm w-36">Round crop</label>
          <input type="checkbox" checked={roundCrop} onChange={(e)=>setRoundCrop(e.target.checked)} />
          <button className="btn-ghost" disabled={!hasImage || !roundCrop} onClick={()=>onApply({ type: 'round-crop' })}>Apply</button>
        </div>
      </div>
    </div>
  )
}

