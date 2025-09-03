import React, { useMemo, useRef, useState } from 'react'
import UploadArea from './components/UploadArea.jsx'
import ActionMenu from './components/ActionMenu.jsx'
import Preview from './components/Preview.jsx'
import DownloadButton from './components/DownloadButton.jsx'
import { useHistory } from './hooks/useHistory.js'
import { applyEditsPipeline, exportCanvasAsBlob, exportMultipleAsZip } from './lib/canvasOps.js'

export default function App() {
  const [sourceImage, setSourceImage] = useState(null)
  const [edits, setEdits] = useState([])
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState(0.92)
  const [busy, setBusy] = useState(false)
  const canvasRef = useRef(null)
  const { history, pushState, canUndo, canRedo, undo, redo } = useHistory()

  const hasImage = !!sourceImage

  const handleUpload = (imgBitmap) => {
    setSourceImage(imgBitmap)
    setEdits([])
    pushState([])
  }

  const handleApply = async (newEdit) => {
    const next = [...edits, newEdit]
    setEdits(next)
    pushState(next)
  }

  const handleUndo = () => {
    const prev = undo()
    if (prev) setEdits(prev)
  }

  const handleRedo = () => {
    const nxt = redo()
    if (nxt) setEdits(nxt)
  }

  const handleClear = () => {
    setEdits([])
    pushState([])
  }

  const renderedCanvas = useMemo(() => ({
    async render(targetCanvas) {
      if (!sourceImage || !targetCanvas) return
      await applyEditsPipeline({ imageBitmap: sourceImage, edits, targetCanvas })
    }
  }), [sourceImage, edits])

  const handleDownload = async () => {
    if (!canvasRef.current) return
    const blob = await exportCanvasAsBlob(canvasRef.current, format, quality)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `edited.${format}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleDownloadZip = async () => {
    if (!canvasRef.current) return
    await exportMultipleAsZip(canvasRef.current, {
      formats: ['png','jpg','webp'],
      quality,
      filenameBase: 'edited'
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-600" />
            <h1 className="text-lg font-semibold">Image Studio</h1>
          </div>
          <div className="toolbar">
            <button className="btn-ghost" onClick={handleUndo} disabled={!canUndo}>Undo</button>
            <button className="btn-ghost" onClick={handleRedo} disabled={!canRedo}>Redo</button>
            <button className="btn-ghost" onClick={handleClear} disabled={!hasImage || edits.length === 0}>Clear</button>
            <button className="btn-primary" onClick={handleDownload} disabled={!hasImage}>Download</button>
            <button className="btn-secondary" onClick={handleDownloadZip} disabled={!hasImage}>Download ZIP</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-4">
          <div className="card p-4">
            <UploadArea onImage={handleUpload} />
          </div>
          <div className="card p-4 mt-4">
            <ActionMenu
              hasImage={hasImage}
              onApply={handleApply}
              busy={busy}
              setBusy={setBusy}
            />
          </div>
        </section>

        <section className="lg:col-span-8">
          <div className="card p-3 h-[70vh] flex items-center justify-center">
            <Preview canvasRef={canvasRef} renderer={renderedCanvas} hasImage={hasImage} />
          </div>
          <div className="card p-4 mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm">Format</label>
              <select value={format} onChange={(e)=>setFormat(e.target.value)} className="border rounded-lg px-2 py-1">
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm">Quality</label>
              <input type="range" min="0.5" max="1" step="0.01" value={quality} onChange={(e)=>setQuality(Number(e.target.value))} />
            </div>
            <DownloadButton onClick={handleDownload} disabled={!hasImage} />
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">Built with React & Tailwind</footer>
    </div>
  )
}

