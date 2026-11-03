import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
  type RenderTask,
} from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl

export function ScorePdf({
  url,
  title,
  onError,
}: {
  url: string
  title: string
  onError: () => void
}) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null)
  const [page, setPage] = useState(1)
  const [bounds, setBounds] = useState({ width: 0, height: 0 })
  const [rendering, setRendering] = useState(true)
  const viewport = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  function changePage(next: number) {
    if (!document || next < 1 || next > document.numPages || next === page) return
    setRendering(true)
    setPage(next)
    if (viewport.current) viewport.current.scrollTop = 0
  }

  useEffect(() => {
    const task = getDocument({ url })
    let active = true
    task.promise
      .then((pdf) => {
        if (active) setDocument(pdf)
      })
      .catch(() => {
        if (active) onError()
      })
    return () => {
      active = false
      void task.destroy()
    }
  }, [url, onError])

  useEffect(() => {
    if (!viewport.current) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBounds((previous) =>
        previous.width === width && previous.height === height ? previous : { width, height },
      )
    })
    observer.observe(viewport.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!document || !bounds.width || !sheet.current) return
    let active = true
    let renderingTask: RenderTask | undefined
    const canvas = window.document.createElement('canvas')
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', `${title} — página ${page}`)
    sheet.current.replaceChildren(canvas)
    document
      .getPage(page)
      .then(async (pdfPage) => {
        if (!active) return
        const original = pdfPage.getViewport({ scale: 1 })
        const scale = Math.min(
          Math.min(bounds.width, 1000) / original.width,
          bounds.height > 0 ? bounds.height / original.height : Infinity,
        )
        const size = pdfPage.getViewport({ scale })
        const resolution = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.floor(size.width * resolution)
        canvas.height = Math.floor(size.height * resolution)
        canvas.style.width = `${Math.floor(size.width)}px`
        canvas.style.height = `${Math.floor(size.height)}px`
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Canvas unavailable')
        renderingTask = pdfPage.render({
          canvas,
          canvasContext: context,
          viewport: size,
          transform: [resolution, 0, 0, resolution, 0, 0],
        })
        await renderingTask.promise
        if (active) {
          canvas.dataset.rendered = 'true'
          setRendering(false)
        }
      })
      .catch(() => {
        if (active) onError()
      })
    return () => {
      active = false
      renderingTask?.cancel()
    }
  }, [document, page, bounds, title, onError])

  return (
    <div className="repertoire-pdf-viewer">
      {(!document || document.numPages > 1) && (
        <div className="repertoire-pdf-controls">
          <div className="repertoire-page-navigation">
            <button
              aria-label="Página anterior"
              disabled={!document || page === 1}
              onClick={() => changePage(page - 1)}
            >
              <ChevronLeft size={19} />
            </button>
            <span aria-live="polite">
              Página {page} de {document?.numPages ?? '…'}
            </span>
            <button
              aria-label="Próxima página"
              disabled={!document || page === document.numPages}
              onClick={() => changePage(page + 1)}
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      )}
      {rendering && (
        <p role="status" className="repertoire-loading">
          <LoaderCircle size={18} className="checkout-spinner" /> Preparando partitura…
        </p>
      )}
      <div
        ref={viewport}
        className="repertoire-pdf"
        title={title}
        tabIndex={0}
        role="region"
        aria-label={`Partitura de ${title}. Use as setas para mudar de página`}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            changePage(page + (event.key === 'ArrowRight' ? 1 : -1))
          }
        }}
        onTouchStart={(event) => {
          const touch = event.touches.length === 1 ? event.touches[0] : undefined
          touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current
          touchStart.current = null
          const touch = event.changedTouches[0]
          if (!start || !touch || event.touches.length) return
          const dx = touch.clientX - start.x
          const dy = touch.clientY - start.y
          if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5)
            changePage(page + (dx < 0 ? 1 : -1))
        }}
        onTouchCancel={() => {
          touchStart.current = null
        }}
      >
        <div ref={sheet} />
      </div>
    </div>
  )
}
