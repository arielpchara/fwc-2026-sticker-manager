import { useOutlet } from 'react-router-dom'
import MainLayout from '../common/MainLayout.js'
import Body from '../common/Body.js'
import Description from '../common/Description.js'
import Tutorial from '../common/Tutorial.js'
import StickerViewer from '../own/StickerViewer.js'

export default function MainPage() {
  const outlet = useOutlet()

  return (
    <MainLayout>
      <Body>
        <Description />
        <Tutorial />
        <StickerViewer />
      </Body>
      {outlet}
    </MainLayout>
  )
}
