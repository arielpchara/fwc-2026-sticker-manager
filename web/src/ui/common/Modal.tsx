import { useEffect, useRef, useCallback, type ReactNode } from 'react'

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open) el.showModal()
    else el.close()
  }, [open])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = () => onCloseRef.current()
    el.addEventListener('close', handler)
    return () => el.removeEventListener('close', handler)
  }, [])

  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === ref.current) onCloseRef.current()
  }, [])

  return (
    <dialog
      ref={ref}
      onClick={handleBackdrop}
      className="backdrop:bg-black/40 backdrop:backdrop-blur-sm bg-surface rounded-xl shadow-xl max-w-lg w-full p-0 border-0 m-auto fixed inset-0 open:flex open:flex-col max-h-[90dvh]"
    >
      {title != null && (
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-fg min-w-0 flex-1 pr-3">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-fg" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <div className="p-5 space-y-4 overflow-y-auto">{children}</div>
    </dialog>
  )
}
