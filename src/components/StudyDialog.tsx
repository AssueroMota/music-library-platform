import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function StudyDialog({
  title,
  label,
  closeLabel,
  onClose,
  children,
}: {
  title: string
  label: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
}) {
  const panel = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const trigger = document.activeElement
    const previousOverflow = document.body.style.overflow
    const dialog = panel.current
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    heading.current?.focus({ preventScroll: true })
    return () => {
      if (dialog?.open) dialog.close()
      document.body.style.overflow = previousOverflow
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog
      ref={panel}
      className="repertoire-workspace repertoire-study-dialog"
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <h2 ref={heading} tabIndex={-1} className="sr-only">
        {title}
      </h2>
      <button
        className="repertoire-study-close"
        onClick={onClose}
        aria-label={closeLabel}
        title={closeLabel}
      >
        <X size={21} />
      </button>
      {children}
    </dialog>
  )
}
