import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "outline" | "ghost";
  size?: "md" | "lg";
  className?: string;
  icon?: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
};

export function Button({
  children,
  href,
  variant = "solid",
  size = "md",
  className,
  icon,
  type = "button",
  onClick,
}: ButtonProps) {
  const classes = clsx(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 whitespace-nowrap",
    size === "md" ? "px-5 py-2.5 text-sm" : "px-6 py-3.5 text-base",
    variant === "solid" &&
      "bg-accent text-accent-contrast hover:bg-accent-2",
    variant === "outline" &&
      "border border-accent text-text hover:bg-accent hover:text-accent-contrast",
    variant === "ghost" &&
      "border border-border text-text hover:border-text-faint",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
        {icon}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
      {icon}
    </button>
  );
}
