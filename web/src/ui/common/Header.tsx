import LogoBar from './LogoBar.js'
import AlbumProgress from './AlbumProgress.js'
import Menu from './Menu.js'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-green-700 to-green-600 text-white px-6 py-4 shadow-md">
      <div className="grid grid-cols-3 items-center">
        <LogoBar />
        <div className="flex justify-center">
          <AlbumProgress />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Menu />
        </div>
      </div>
    </header>
  )
}
