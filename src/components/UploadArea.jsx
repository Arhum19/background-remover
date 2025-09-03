import React, { useCallback, useRef, useState } from 'react'

export default function UploadArea({ onImage }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback(async (file) => {
    if (!file) return
    const blob = await file.arrayBuffer()
    const bitmap = await createImageBitmap(new Blob([blob]))
    onImage(bitmap)
  }, [onImage])

  const onDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    await handleFiles(file)
  }

  const onChange = async (e) => {
    const file = e.target.files?.[0]
    await handleFiles(file)
  }

  return (
    <div
      onDragOver={(e)=>{e.preventDefault(); setDragOver(true)}}
      onDragLeave={()=>setDragOver(false)}
      onDrop={onDrop}
      className={`rounded-xl border-2 border-dashed p-8 text-center transition ${dragOver ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-white border flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-gray-600"><path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v10.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75z" clipRule="evenodd" /><path d="M3 13.5a.75.75 0 01.75.75V18A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18v-3.75a.75.75 0 011.5 0V18a3.75 3.75 0 01-3.75 3.75H6A3.75 3.75 0 012.25 18v-3.75A.75.75 0 013 13.5z" /></svg>
        </div>
        <p className="text-sm text-gray-700">Drag & drop an image here, or</p>
        <button className="btn-primary" onClick={()=>inputRef.current?.click()}>Browse</button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      </div>
    </div>
  )
}

