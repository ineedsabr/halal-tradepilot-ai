import type { ReactNode } from 'react';

type ActionCardProps = {
  title: string;
  description: string;
  meta?: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

export function ActionCard({ title, description, meta, icon, disabled = false, onClick }: ActionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'min-h-32 rounded-[1.35rem] border p-4 text-left transition active:scale-[0.98]',
        'shadow-[0_2px_8px_rgba(17,24,39,0.04),0_14px_36px_rgba(17,24,39,0.07)] dark:shadow-[0_16px_42px_rgba(0,0,0,0.28)]',
        disabled
          ? 'border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] text-[rgb(var(--app-muted))]'
          : 'border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface)/0.96)] text-[rgb(var(--app-text))] hover:-translate-y-0.5 hover:border-[rgb(var(--app-primary)/0.42)]',
      ].join(' ')}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-base font-semibold">{title}</span>
          {meta ? (
            <span className="mt-2 inline-flex rounded-full border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[rgb(var(--app-muted))]">
              {meta}
            </span>
          ) : null}
        </span>
        {icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--app-primary)/0.10)] text-[rgb(var(--app-primary))]">
            {icon}
          </span>
        ) : null}
      </span>
      <span className="mt-3 block text-sm leading-6 text-[rgb(var(--app-muted))]">
        {description}
      </span>
    </button>
  );
}
