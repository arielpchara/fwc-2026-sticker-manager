import LogoBar from "./LogoBar.js";
import AlbumProgress from "./AlbumProgress.js";
import Menu from "./Menu.js";

export default function Header({ compact = false }: { compact?: boolean }) {
  return (
    <header
      className={`bg-surface border-b border-border shadow-md shrink-0 z-40 transition-all duration-200 ${
        compact ? "px-4 py-1.5" : "px-6 py-4"
      }`}
    >
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex-1 min-w-0 flex justify-start">
          <LogoBar compact={compact} />
        </div>
        <div className="flex-1 min-w-0 flex justify-center">
          <AlbumProgress compact={compact} />
        </div>
        <div className="flex-1 min-w-0 flex justify-end">
          <Menu />
        </div>
      </div>
    </header>
  );
}
