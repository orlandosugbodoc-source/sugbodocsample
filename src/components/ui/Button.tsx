import React from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", fullWidth = false, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-6 py-2.5";

    const variants = {
      primary: "bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary shadow-sm",
      secondary: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-primary shadow-sm",
      danger: "border-2 border-danger text-danger bg-white hover:bg-danger-light focus-visible:ring-danger",
      ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-primary",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          fullWidth ? "w-full" : "",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
