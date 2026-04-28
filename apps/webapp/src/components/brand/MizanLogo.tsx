type MizanLogoProps = {
  size?: number;
  monochrome?: boolean;
  className?: string;
};

export function MizanLogo({ size = 32, monochrome = false, className }: MizanLogoProps) {
  const accent = monochrome ? 'currentColor' : 'rgb(var(--app-primary))';

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 64 64"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        height="56"
        rx="16"
        stroke={accent}
        strokeWidth="4"
        width="56"
        x="4"
        y="4"
      />
      <path
        d="M18 43V21l14 17 14-17v22"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M20 21h24M16 30h32M23 50h18"
        stroke={accent}
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}
