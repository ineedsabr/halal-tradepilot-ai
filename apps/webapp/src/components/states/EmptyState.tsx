import { useTranslation } from 'react-i18next';

export function EmptyState() {
  const { t } = useTranslation();

  return (
    <section className="rounded-lg border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-5">
      <p className="m-0 text-sm font-medium text-[rgb(var(--app-text))]">{t('empty.title')}</p>
      <p className="mt-2 text-sm leading-6 text-[rgb(var(--app-muted))]">{t('empty.description')}</p>
    </section>
  );
}
