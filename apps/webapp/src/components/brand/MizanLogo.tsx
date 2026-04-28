type MizanLogoProps = {
  size?: number;
  monochrome?: boolean;
  className?: string;
};

export function MizanLogo({ size = 32, monochrome = false, className }: MizanLogoProps) {
  const accent = monochrome ? 'currentColor' : 'rgb(var(--app-primary))';
  const gold = monochrome ? 'currentColor' : 'rgb(var(--app-gold))';

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
      <path
        d="M32 8c13.255 0 24 10.745 24 24S45.255 56 32 56 8 45.255 8 32 18.745 8 32 8Z"
        fill="rgb(var(--app-surface))"
        stroke={accent}
        strokeWidth="3.4"
      />
      <path
        d="M18 42V23.5l14 15.2 14-15.2V42"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.2"
      />
      <path
        d="M20 22h24M16.5 31.5h31M25 48h14"
        stroke={accent}
        strokeLinecap="round"
        strokeWidth="3.6"
      />
      <path
        d="M22 32.5l-5 8h10l-5-8Zm20 0-5 8h10l-5-8Z"
        stroke={gold}
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </svg>
  );
}
