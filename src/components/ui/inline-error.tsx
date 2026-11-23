type InlineErrorProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function InlineError({
  message,
  onRetry,
  retryLabel = "Try again",
  className = "",
}: InlineErrorProps) {
  return (
    // Reuses .form-error colors so inline and form errors look identical.
    // role="alert" announces immediately; don't also put role="alert" on a parent or it is read twice.
    <div className={`form-error inline-error ${className}`.trim()} role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
