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
  const [width, setWidth] = useState(0)
  const [rendering, setRendering] = useState(true)
  const viewport = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)

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
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(viewport.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!document || !width || !sheet.current) return
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
        const size = pdfPage.getViewport({ scale: width / original.width })
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
  }, [document, page, width, title, onError])

  return (
    <div className="repertoire-pdf-viewer">
      <div className="repertoire-pdf-controls">
        <div className="repertoire-page-navigation">
          <button
            aria-label="Página anterior"
            disabled={!document || page === 1}
            onClick={() => {
              setRendering(true)
              setPage(page - 1)
            }}
          >
            <ChevronLeft size={19} />
          </button>
          <span aria-live="polite">
            Página {page} de {document?.numPages ?? '…'}
          </span>
          <button
            aria-label="Próxima página"
            disabled={!document || page === document.numPages}
            onClick={() => {
              setRendering(true)
              setPage(page + 1)
            }}
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
      {rendering && (
        <p role="status" className="repertoire-loading">
          <LoaderCircle size={18} className="checkout-spinner" /> Preparando partitura…
        </p>
      )}
      <div ref={viewport} className="repertoire-pdf" title={title}>
        <div ref={sheet} />
      </div>
    </div>
  )
}
