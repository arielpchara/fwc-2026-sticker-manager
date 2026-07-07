import { useEffect, useRef, useCallback, type ReactNode } from 'react'

export default function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
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
    <dialog ref={ref} onClick={handleBackdrop} className="backdrop:bg-black/40 rounded-xl shadow-xl max-w-lg w-full p-0 border-0 m-auto fixed inset-0">
      <div className="p-5 space-y-4">
        {children}
      </div>
    </dialog>
  )
}
