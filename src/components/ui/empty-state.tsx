import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  // Pass a <Link> or <button> styled by the caller, so EmptyState stays layout-only.
  action?: ReactNode;
  // Full-page states (e.g. 404) need the h1; inline empty lists inside a page should stay h2.
  titleAs?: "h1" | "h2";
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  titleAs: Title = "h2",
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      {/* Icon is decorative; the title carries the meaning. */}
      <Icon className="empty-state-icon" size={28} aria-hidden="true" />
      <Title>{title}</Title>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
