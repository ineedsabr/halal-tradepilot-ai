import type { FormEvent, PropsWithChildren } from 'react';

type PremiumCardProps = PropsWithChildren<{
  as?: 'article' | 'section' | 'div' | 'form';
  className?: string;
  padded?: boolean;
  elevated?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}>;

export function PremiumCard({
  as: Element = 'section',
  children,
  className = '',
  padded = true,
  elevated = true,
  onSubmit,
}: PremiumCardProps) {
  const classes = [
    'rounded-[1.35rem] border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface)/0.94)] backdrop-blur',
    padded ? 'p-4' : '',
    elevated ? 'shadow-[0_2px_8px_rgba(17,24,39,0.05),0_16px_42px_rgba(17,24,39,0.07)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.30)]' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (Element === 'form') {
    return (
      <form className={classes} onSubmit={onSubmit}>
        {children}
      </form>
    );
  }

  return <Element className={classes}>{children}</Element>;
}
