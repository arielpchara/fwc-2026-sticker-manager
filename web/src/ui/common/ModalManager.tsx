import type { Translations } from '../../i18n/locales/en.js'
import { useLocale } from '../../i18n/index.js'
import { AddStickers } from '../own/AddStickers/index.js'
import Modal from './Modal.js'

const MODAL_MAP: Record<string, { titleKey: keyof Translations; component: React.ComponentType }> = {
  own: { titleKey: 'dialogOwn', component: AddStickers },
}

export default function ModalManager({ modalContent, onClose }: { modalContent: string | null; onClose: () => void }) {
  const { t } = useLocale()
  const entry = modalContent ? MODAL_MAP[modalContent] : null

  return (
    <Modal open={modalContent !== null} onClose={onClose}>
      {entry && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-fg">{t(entry.titleKey)}</h2>
            <button onClick={onClose} className="text-muted hover:text-fg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="bg-white rounded-xl p-4">
            <entry.component />
          </div>
        </>
      )}
    </Modal>
  )
}
