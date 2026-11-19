import type { InputHTMLAttributes, Ref } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: Ref<HTMLInputElement>;
};

export function Input({ className = "", ...props }: InputProps) {
  return <input className={`ui-input ${className}`.trim()} {...props} />;
}
