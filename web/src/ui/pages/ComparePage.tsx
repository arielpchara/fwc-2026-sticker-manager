import { Outlet } from 'react-router-dom'
import MainLayout from '../common/MainLayout.js'
import Body from '../common/Body.js'
import CompareStickers from '../compare/CompareStickers.js'

export default function ComparePage() {
  return (
    <MainLayout>
      <Body>
        <CompareStickers />
      </Body>
      <Outlet />
    </MainLayout>
  )
}
