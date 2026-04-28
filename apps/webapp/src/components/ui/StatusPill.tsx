type StatusPillTone = 'positive' | 'warning' | 'danger' | 'neutral' | 'gold';

type StatusPillProps = {
  label?: string;
  value: string;
  tone?: StatusPillTone;
};

const toneClasses: Record<StatusPillTone, string> = {
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100',
  danger: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100',
  neutral: 'border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] text-[rgb(var(--app-text))]',
  gold: 'border-[rgb(var(--app-gold)/0.35)] bg-[rgb(var(--app-gold)/0.11)] text-[rgb(var(--app-gold-strong))]',
};

export function StatusPill({ label, value, tone = 'neutral' }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {label ? <span className="text-[rgb(var(--app-muted))]">{label}</span> : null}
      <span>{value}</span>
    </span>
  );
}
