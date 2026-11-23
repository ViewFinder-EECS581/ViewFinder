type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

// "md" is the original 28px route spinner, so it needs no modifier class.
const sizeClasses = { sm: "spinner-sm", md: "", lg: "spinner-lg" };

export function Spinner({
  size = "md",
  label = "Loading",
  className = "",
}: SpinnerProps) {
  return (
    // role="status" lets screen readers announce the label; the ring itself is decorative.
    <span
      className={`route-state-spinner ${sizeClasses[size]} ${className}`.trim()}
      role="status"
      aria-label={label}
    />
  );
}
