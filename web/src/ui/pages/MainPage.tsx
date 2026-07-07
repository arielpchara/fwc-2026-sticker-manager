import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../common/MainLayout.js'
import Body from '../common/Body.js'
import Description from '../common/Description.js'
import Tutorial from '../common/Tutorial.js'
import StickerViewer from '../own/StickerViewer.js'
import StickerMatrix from '../own/StickerMatrix.js'
import { useOwnStickers } from '../../application/useStickers.js'
import { TOTAL_STICKERS } from '../data/stickers.js'
import ModalManager from '../common/ModalManager.js'

export default function MainPage() {
  const navigate = useNavigate()
  const { inv } = useOwnStickers()
  const albumOwned = Object.keys(inv).length
  const [modalContent, setModalContent] = useState<string | null>(null)
  const [showMatrix, setShowMatrix] = useState(false)

  return (
    <MainLayout
      albumOwned={albumOwned}
      albumTotal={TOTAL_STICKERS}
      onOwnClick={() => { setShowMatrix(false); setModalContent('own') }}
      onSurplusClick={() => { setShowMatrix(false); setModalContent('surplus') }}
      onCompareClick={() => navigate('/compare')}
      onMatrixClick={() => setShowMatrix((v) => !v)}
    >
      {showMatrix ? (
        <div className="flex-1 p-4 sm:p-6">
          <StickerMatrix />
        </div>
      ) : (
        <Body>
          <Description />
          <Tutorial />
          <StickerViewer />
        </Body>
      )}

      <ModalManager modalContent={modalContent} onClose={() => setModalContent(null)} />
    </MainLayout>
  )
}
