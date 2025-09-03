import JSZip from 'jszip'

function createCanvas(width, height) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  return c
}

export async function applyEditsPipeline({ imageBitmap, edits, targetCanvas }) {
  let workingCanvas = createCanvas(imageBitmap.width, imageBitmap.height)
  let ctx = workingCanvas.getContext('2d')
  ctx.clearRect(0,0,workingCanvas.width,workingCanvas.height)
  ctx.drawImage(imageBitmap, 0, 0)

  for (const edit of edits) {
    switch (edit.type) {
      case 'replace-image': {
        workingCanvas = createCanvas(edit.imageBitmap.width, edit.imageBitmap.height)
        ctx = workingCanvas.getContext('2d')
        ctx.drawImage(edit.imageBitmap, 0, 0)
        break
      }
      case 'bg-color': {
        const newCanvas = createCanvas(workingCanvas.width, workingCanvas.height)
        const nctx = newCanvas.getContext('2d')
        nctx.fillStyle = edit.color || '#000'
        nctx.fillRect(0,0,newCanvas.width,newCanvas.height)
        nctx.drawImage(workingCanvas, 0, 0)
        workingCanvas = newCanvas
        ctx = nctx
        break
      }
      case 'bg-image': {
        const newCanvas = createCanvas(Math.max(workingCanvas.width, edit.imageBitmap.width), Math.max(workingCanvas.height, edit.imageBitmap.height))
        const nctx = newCanvas.getContext('2d')
        nctx.drawImage(edit.imageBitmap, 0, 0, newCanvas.width, newCanvas.height)
        nctx.drawImage(workingCanvas, 0, 0)
        workingCanvas = newCanvas
        ctx = nctx
        break
      }
      case 'resize': {
        const width = edit.width || workingCanvas.width
        const height = edit.height || Math.round((workingCanvas.height / workingCanvas.width) * width)
        const newCanvas = createCanvas(width, height)
        newCanvas.getContext('2d').drawImage(workingCanvas, 0, 0, width, height)
        workingCanvas = newCanvas
        ctx = workingCanvas.getContext('2d')
        break
      }
      case 'crop-ratio': {
        const ratio = edit.ratio || 1
        const currentRatio = workingCanvas.width / workingCanvas.height
        let cropW = workingCanvas.width
        let cropH = workingCanvas.height
        if (currentRatio > ratio) {
          cropW = Math.round(workingCanvas.height * ratio)
        } else {
          cropH = Math.round(workingCanvas.width / ratio)
        }
        const x = Math.round((workingCanvas.width - cropW) / 2)
        const y = Math.round((workingCanvas.height - cropH) / 2)
        const newCanvas = createCanvas(cropW, cropH)
        newCanvas.getContext('2d').drawImage(workingCanvas, x, y, cropW, cropH, 0, 0, cropW, cropH)
        workingCanvas = newCanvas
        ctx = workingCanvas.getContext('2d')
        break
      }
      case 'filter': {
        ctx.filter = filterCssFor(edit.name)
        const snapshot = ctx.getImageData(0,0,workingCanvas.width, workingCanvas.height)
        ctx.clearRect(0,0,workingCanvas.width, workingCanvas.height)
        const temp = createCanvas(workingCanvas.width, workingCanvas.height)
        temp.getContext('2d').putImageData(snapshot, 0, 0)
        ctx.drawImage(temp, 0, 0)
        ctx.filter = 'none'
        break
      }
      case 'watermark': {
        ctx.font = '24px ui-sans-serif, system-ui, -apple-system'
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.textBaseline = 'bottom'
        ctx.fillText(edit.text, 16, workingCanvas.height - 16)
        break
      }
      case 'round-crop': {
        const size = Math.min(workingCanvas.width, workingCanvas.height)
        const x = Math.floor((workingCanvas.width - size) / 2)
        const y = Math.floor((workingCanvas.height - size) / 2)
        const square = createCanvas(size, size)
        square.getContext('2d').drawImage(workingCanvas, x, y, size, size, 0, 0, size, size)
        const masked = createCanvas(size, size)
        const mctx = masked.getContext('2d')
        mctx.save()
        mctx.beginPath()
        mctx.arc(size/2, size/2, size/2, 0, Math.PI * 2)
        mctx.closePath()
        mctx.clip()
        mctx.drawImage(square, 0, 0)
        mctx.restore()
        workingCanvas = masked
        ctx = workingCanvas.getContext('2d')
        break
      }
      case 'compress': {
        // No-op in pipeline; compression applied on export via quality
        break
      }
      case 'convert': {
        // No-op here; conversion done on export
        break
      }
      default:
        break
    }
  }

  targetCanvas.width = workingCanvas.width
  targetCanvas.height = workingCanvas.height
  const tctx = targetCanvas.getContext('2d')
  tctx.clearRect(0,0,targetCanvas.width, targetCanvas.height)
  tctx.drawImage(workingCanvas, 0, 0)
}

function filterCssFor(name) {
  switch (name) {
    case 'grayscale': return 'grayscale(1)'
    case 'sepia': return 'sepia(1)'
    case 'blur': return 'blur(3px)'
    case 'brightness': return 'brightness(1.2)'
    case 'contrast': return 'contrast(1.2)'
    default: return 'none'
  }
}

export async function exportCanvasAsBlob(canvas, format, quality=0.92) {
  const type = format === 'jpg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp'
  return await new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

export async function exportMultipleAsZip(canvas, { formats, quality=0.92, filenameBase='image' }) {
  const zip = new JSZip()
  for (const fmt of formats) {
    const blob = await exportCanvasAsBlob(canvas, fmt, quality)
    zip.file(`${filenameBase}.${fmt}`, blob)
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filenameBase}.zip`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

