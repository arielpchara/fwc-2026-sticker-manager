import { useState, type ReactNode, type UIEvent } from "react";
import Header from "./Header.js";
import Footer from "./Footer.js";
import Tutorial from "./Tutorial.js";
import Description from "./Description.js";
import BottomNav from "./BottomNav.js";

export default function MainLayout({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false);

  function onScroll(e: UIEvent<HTMLElement>) {
    setCompact(e.currentTarget.scrollTop > 8);
  }

  return (
    <div className="h-dvh flex flex-col bg-bg overflow-hidden">
      <Header compact={compact} />
      <Description compact={compact} />
      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-surface p-5 gap-6 overflow-y-auto">
          <Tutorial />
        </aside>
        <main
          className="flex-1 flex flex-col min-w-0 overflow-y-auto"
          onScroll={onScroll}
        >
          {children}
        </main>
      </div>
      <Footer className="hidden md:block" />
      <BottomNav />
    </div>
  );
}
