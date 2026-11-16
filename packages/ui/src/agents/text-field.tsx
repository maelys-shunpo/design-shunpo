import { cva, type VariantProps } from "class-variance-authority";
import type { InputHTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const fieldVariants = cva(
  "w-full border border-border bg-background px-4 text-foreground transition-colors duration-200 placeholder:text-muted-foreground hover:border-foreground/30 focus-visible:border-foreground/50",
  {
    variants: {
      size: {
        md: "h-10 text-sm",
        lg: "h-12 text-md",
      },
    },
    defaultVariants: { size: "lg" },
  },
);

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, VariantProps<typeof fieldVariants> {
  /* The field's name for assistive technology; shown only to screen readers. */
  label: string;
  className?: string | undefined;
}

/* A single-line field, the height of the action beside it. */
export function TextField({ label, size, className, ...props }: TextFieldProps) {
  return (
    <label data-slot="text-field" className="flex flex-1 flex-col">
      <span className="sr-only">{label}</span>
      <input className={cn(fieldVariants({ size }), className)} {...props} />
    </label>
  );
}
