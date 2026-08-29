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

export async function compressImage(file: File): Promise<Blob> {
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
