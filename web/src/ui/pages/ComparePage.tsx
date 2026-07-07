import { useOwnStickers } from '../../application/useStickers.js'
import { TOTAL_STICKERS } from '../../data/stickers.js'
import MainLayout from '../common/MainLayout.js'
import Body from '../common/Body.js'
import CompareStickers from '../compare/CompareStickers.js'

export default function ComparePage() {
  const { inv } = useOwnStickers()
  const albumOwned = Object.keys(inv).length

  return (
    <MainLayout albumOwned={albumOwned} albumTotal={TOTAL_STICKERS}>
      <Body>
        <CompareStickers />
      </Body>
    </MainLayout>
  )
}
