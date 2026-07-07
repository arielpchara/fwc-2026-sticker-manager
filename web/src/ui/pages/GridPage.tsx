import MainLayout from '../common/MainLayout.js'
import StickerMatrix from '../own/StickerMatrix.js'

export default function GridPage() {
  return (
    <MainLayout>
      <div className="flex-1 p-4 sm:p-6">
        <StickerMatrix />
      </div>
    </MainLayout>
  )
}
