Image Studio (React + Tailwind)

Development
- npm install
- npm run dev

Features
- Upload via drag-and-drop or picker
- Action menu: background removal (API), background color/image, resize/crop presets, filters, watermark, round crop, compression, convert
- Live preview with undo/redo
- Download PNG/JPG/WebP, or ZIP of all formats

Architecture
- Components: UploadArea, ActionMenu, Preview, DownloadButton
- Canvas pipeline in src/lib/canvasOps.js composes edits and renders to a canvas
- Background removal in src/lib/bgRemove.js (on-demand; user selects image to avoid auto quota spend)
- Undo/redo implemented by storing edit arrays in a simple history hook

