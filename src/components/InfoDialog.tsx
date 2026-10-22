import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

export function InfoDialog({
  info,
  onClose,
}: {
  info: { title: string; text: string } | null
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = dialogRef.current
    if (info && !dialog?.open) dialog?.showModal()
    else if (!info && dialog?.open) dialog.close()
  }, [info])
  return (
    <dialog
      ref={dialogRef}
      className="info-dialog"
      aria-labelledby={titleId}
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="dialog-content">
        <button className="dialog-close" aria-label="Fechar informações" onClick={onClose}>
          <X size={21} />
        </button>
        <span className="eyebrow">
          <i />
          MUSIC LIBRARY
        </span>
        <h2 id={titleId}>{info?.title}</h2>
        <p>{info?.text}</p>
        <button className="button button-gold" onClick={onClose}>
          Entendi
        </button>
      </div>
    </dialog>
  )
}
