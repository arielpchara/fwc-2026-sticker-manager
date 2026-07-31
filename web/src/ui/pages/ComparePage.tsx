import { Outlet } from 'react-router-dom'
import MainLayout from '../common/MainLayout.js'
import CompareStickers from '../compare/CompareStickers.js'

export default function ComparePage() {
  return (
    <MainLayout>
      <div className="flex-1 w-full px-4 py-8">
        <CompareStickers />
      </div>
      <Outlet />
    </MainLayout>
  )
}
