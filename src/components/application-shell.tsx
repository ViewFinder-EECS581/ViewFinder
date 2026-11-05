import type { ReactNode } from "react";

type ApplicationShellProps = {
  brand: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
};

export function ApplicationShell({
  brand,
  controls,
  children,
}: ApplicationShellProps) {
  return (
    <div className="application-shell">
      <header className="application-header">
        {brand}
        {controls && (
          <div className="application-header-controls">{controls}</div>
        )}
      </header>
      <main className="application-content">{children}</main>
    </div>
  );
}
