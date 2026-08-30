import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { cropToSquareJpeg } from "./data/image"

type Source = (HTMLImageElement | ImageBitmap) & { width: number; height: number }

export function PhotoCrop({
  file,
  onCancel,
  onDone,
  onError,
}: {
  file: File
  onCancel: () => void
  onDone: (blob: Blob) => void
  onError: (message: string) => void
}) {
  const viewRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const errorRef = useRef(onError)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; scale: number } | null>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  )
  const [source, setSource] = useState<Source>()
  const [view, setView] = useState(0)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)

  errorRef.current = onError

  const minScale =
    source && view
      ? Math.max(view / source.width, view / source.height)
      : 1
  const maxScale = minScale * 4

  useEffect(() => {
    let alive = true
    let bitmap: ImageBitmap | undefined
    let objectUrl = ""

    async function load() {
      if (typeof createImageBitmap === "function") {
        try {
          bitmap = await createImageBitmap(file, {
            imageOrientation: "from-image",
          })
          if (!alive) {
            bitmap.close()
            return
          }
          setSource(bitmap)
          return
        } catch {
          bitmap = undefined
        }
      }

      objectUrl = URL.createObjectURL(file)
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error("load"))
        img.src = objectUrl
      })
      if (alive) setSource(image)
    }

    load().catch(() => {
      if (alive) errorRef.current("이 사진은 쓸 수 없어요. 다른 장으로 찍어 주세요.")
    })

    return () => {
      alive = false
      bitmap?.close()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  useEffect(() => {
    const node = viewRef.current
    if (!node) return
    const pass = () => setView(node.clientWidth)
    pass()
    const observer = new ResizeObserver(pass)
    observer.observe(node)
    return () => observer.disconnect()
  }, [source])

  useEffect(() => {
    if (!source || !view) return
    setScale(Math.max(view / source.width, view / source.height))
    setOffset({ x: 0, y: 0 })
  }, [source, view])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !(source instanceof ImageBitmap)) return
    canvas.width = source.width
    canvas.height = source.height
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(source, 0, 0)
  }, [source])

  function clamp(nextScale: number, ox: number, oy: number) {
    if (!source) return { x: 0, y: 0 }
    const imgW = source.width * nextScale
    const imgH = source.height * nextScale
    const maxX = Math.max(0, (imgW - view) / 2)
    const maxY = Math.max(0, (imgH - view) / 2)
    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    }
  }

  function zoomTo(next: number) {
    const limited = Math.min(maxScale, Math.max(minScale, next))
    setScale(limited)
    setOffset((current) => clamp(limited, current.x, current.y))
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        scale,
      }
      drag.current = null
      return
    }
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinch.current.dist > 0) {
        zoomTo(pinch.current.scale * (dist / pinch.current.dist))
      }
      return
    }
    if (!drag.current || pointers.current.size !== 1) return
    setOffset(
      clamp(
        scale,
        drag.current.ox + (event.clientX - drag.current.x),
        drag.current.oy + (event.clientY - drag.current.y),
      ),
    )
  }

  function endPointer(event: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    if (pointers.current.size === 0) drag.current = null
  }

  async function confirm() {
    if (!source || !view || busy) return
    setBusy(true)
    try {
      const size = view / scale
      const x = (source.width - size) / 2 - offset.x / scale
      const y = (source.height - size) / 2 - offset.y / scale
      onDone(await cropToSquareJpeg(source, { x, y, size }))
    } catch {
      errorRef.current("이 사진은 쓸 수 없어요. 다른 장으로 찍어 주세요.")
      onCancel()
    }
  }

  const left = source ? (view - source.width * scale) / 2 + offset.x : 0
  const top = source ? (view - source.height * scale) / 2 + offset.y : 0
  const layerStyle = {
    width: source?.width,
    height: source?.height,
    transform: `translate(${left}px, ${top}px) scale(${scale})`,
  }
  const zoomMin = minScale || 0.01
  const zoomMax = maxScale || 1

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-[430px] flex-col bg-night text-ink">
      <div className="flex items-center justify-between px-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer text-[11px] tracking-[0.06em] text-mist transition duration-150 hover:text-ink"
        >
          ← 다시 찍기
        </button>
        <button
          type="button"
          disabled={!source || busy}
          onClick={() => {
            void confirm()
          }}
          className="cursor-pointer rounded-full px-3 py-1.5 text-[12.5px] font-medium text-clay transition duration-150 hover:bg-card active:scale-95 disabled:text-mist"
        >
          {busy ? "맞추는 중" : "이 컷으로"}
        </button>
      </div>
      <p className="px-4 pt-4 text-[11px] text-mist">
        밀거나 핀치해서 크기를 맞추세요
      </p>
      <div className="px-4 pt-4">
        <div
          ref={viewRef}
          className="relative aspect-square touch-none overflow-hidden rounded-2xl bg-card"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onWheel={(event) => {
            event.preventDefault()
            zoomTo(scale * (event.deltaY > 0 ? 0.94 : 1.06))
          }}
        >
          {source instanceof ImageBitmap ? (
            <canvas
              ref={canvasRef}
              className="absolute origin-top-left"
              style={layerStyle}
            />
          ) : source ? (
            <img
              src={source.src}
              alt=""
              draggable={false}
              className="absolute max-w-none origin-top-left select-none"
              style={layerStyle}
            />
          ) : (
            <p className="flex size-full items-center justify-center text-[11px] text-mist">
              불러오는 중
            </p>
          )}
        </div>
      </div>
      <label className="mt-5 flex items-center gap-3 px-4">
        <span className="text-[10px] tracking-[0.08em] text-mist">작게</span>
        <input
          type="range"
          min={zoomMin}
          max={zoomMax}
          step={(zoomMax - zoomMin) / 80}
          value={Math.min(zoomMax, Math.max(zoomMin, scale))}
          disabled={!source}
          onChange={(event) => zoomTo(Number(event.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-line accent-clay"
        />
        <span className="text-[10px] tracking-[0.08em] text-mist">크게</span>
      </label>
    </div>
  )
}
