const API_KEY = 'd99866261d7f4e5abc21dba687582b78'
const API_URL = 'https://api.slazzer.com/v2.0/remove_image_background'

// Send the provided Blob to API to avoid surprise quota usage.
export async function removeBackgroundFromBlob(imageBlob) {
  const form = new FormData()
  form.append('source_image_file', imageBlob)
  form.append('bg_color', 'transparent')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'X-API-KEY': API_KEY },
    body: form
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Background removal failed: ${res.status} ${text}`)
  }

  return await res.blob()
}

