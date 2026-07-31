import { useEffect, type ReactNode } from "react";

/** Height of BottomNav row (h-14) + home indicator safe area */
const NAV_BOTTOM =
  "calc(3.5rem + env(safe-area-inset-bottom, 0px))";

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-x-0 top-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ bottom: NAV_BOTTOM }}
        onClick={onClose}
        aria-hidden={!open}
      />
      <div
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        className={`fixed inset-x-0 z-40 flex flex-col bg-surface border-t border-border rounded-t-2xl shadow-xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
        style={{
          bottom: NAV_BOTTOM,
          maxHeight: `calc(100dvh - ${NAV_BOTTOM} - 0.5rem)`,
        }}
      >
        <div className="flex justify-center pt-2 pb-1 shrink-0">
          <span className="w-10 h-1 rounded-full bg-border" />
        </div>
        {title != null && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-border shrink-0">
            <h2 className="text-base font-semibold text-fg min-w-0 flex-1 pr-3">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-fg p-1"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );
}
