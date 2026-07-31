import type { ReactNode } from "react";

export default function Body({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`flex-1 w-full max-w-3xl mx-auto px-4 py-8 space-y-10 ${className}`}
    >
      {children}
    </main>
  );
}
