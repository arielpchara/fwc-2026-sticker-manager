import { useState } from 'react'
import MainLayout from './MainLayout.js'
import Body from './Body.js'
import Description from './Description.js'
import StickerViewer from './StickerViewer.js'
import Modal from './Modal.js'
import { AddOwnStickers, AddSurplusStickers } from './AddStickers/index.js'

type Mode = 'own' | 'surplus'

export default function MainPage() {
  const [mode, setMode] = useState<Mode | null>(null)

  return (
    <MainLayout onOwnClick={() => setMode('own')} onSurplusClick={() => setMode('surplus')}>
      <Body>
        <Description />
        <StickerViewer />
      </Body>

      <Modal open={mode !== null} onClose={() => setMode(null)}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {mode === 'own' ? 'Own Stickers' : 'Surplus Stickers'}
          </h2>
          <button onClick={() => setMode(null)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {mode === 'own' ? <AddOwnStickers /> : mode === 'surplus' ? <AddSurplusStickers /> : null}
      </Modal>
    </MainLayout>
  )
}
