import clsx from "clsx";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="220 0 740 650"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M250 20H420V325H350C295 325 250 280 250 225V20Z" fill="currentColor" />
      <path d="M420 360L685 45H930L492 543H250V430C250 391 282 360 320 360H420Z" fill="currentColor" />
      <path d="M638 420L842 625H586L518 554L638 420Z" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  subtitle = true,
}: {
  className?: string;
  markClassName?: string;
  subtitle?: boolean;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <span className="relative shrink-0">
        <LogoMark className={clsx("h-8 w-9 text-accent", markClassName)} />
        <span className="absolute -right-1 -top-1 text-[5px] font-bold leading-none text-text">TM</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight text-text">
          KAALEX
        </span>
        {subtitle && (
          <span className="text-[7px] font-medium uppercase tracking-[0.08em] text-text">
            Technology &amp; Growth Company
          </span>
        )}
      </span>
    </span>
  );
}
