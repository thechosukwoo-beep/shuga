const MAX_SIDE = 1200
const JPEG_QUALITY = 0.8

async function sourceToCanvas(
  source: ImageBitmap | HTMLImageElement,
): Promise<HTMLCanvasElement> {
  const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height))
  const width = Math.max(1, Math.round(source.width * scale))
  const height = Math.max(1, Math.round(source.height * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas")
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(source, 0, 0, width, height)
  return canvas
}

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("blob"))
        else resolve(blob)
      },
      "image/jpeg",
      JPEG_QUALITY,
    )
  })
}

export async function cropToSquareJpeg(
  source: CanvasImageSource & { width: number; height: number },
  crop: { x: number; y: number; size: number },
): Promise<Blob> {
  const srcW =
    "naturalWidth" in source && source.naturalWidth > 0
      ? source.naturalWidth
      : source.width
  const srcH =
    "naturalHeight" in source && source.naturalHeight > 0
      ? source.naturalHeight
      : source.height
  const size = Math.max(1, Math.min(crop.size, srcW, srcH))
  const x = Math.min(Math.max(0, crop.x), Math.max(0, srcW - size))
  const y = Math.min(Math.max(0, crop.y), Math.max(0, srcH - size))
  const out = Math.min(MAX_SIDE, Math.round(size))
  const canvas = document.createElement("canvas")
  canvas.width = out
  canvas.height = out
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas")
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, out, out)
  ctx.drawImage(source, x, y, size, size, 0, 0, out, out)
  return canvasToJpegBlob(canvas)
}

export async function compressImage(file: Blob): Promise<Blob> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      })
      try {
        return canvasToJpegBlob(await sourceToCanvas(bitmap))
      } finally {
        bitmap.close()
      }
    } catch {
      // Some formats (HEIC) fail here; try a regular image load next.
    }
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("load"))
    }
    img.src = url
  })

  return canvasToJpegBlob(await sourceToCanvas(image))
}
