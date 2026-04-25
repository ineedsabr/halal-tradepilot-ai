import { useTranslation } from 'react-i18next';

export function SkeletonLoader() {
  const { t } = useTranslation();

  return (
    <section
      className="rounded-lg border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-5"
      aria-label={t('loading')}
    >
      <div className="grid gap-3">
        <div className="h-4 w-1/3 animate-pulse rounded bg-[rgb(var(--app-border))]" />
        <div className="h-3 w-full animate-pulse rounded bg-[rgb(var(--app-border))]" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-[rgb(var(--app-border))]" />
      </div>
    </section>
  );
}
