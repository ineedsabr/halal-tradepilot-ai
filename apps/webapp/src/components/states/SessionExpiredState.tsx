import { useTranslation } from 'react-i18next';

export function SessionExpiredState() {
  const { t } = useTranslation();

  return (
    <main className="grid min-h-screen place-items-center bg-[rgb(var(--app-bg))] px-4 text-[rgb(var(--app-text))]">
      <section className="w-full max-w-sm rounded-lg border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-5 text-center">
        <h1 className="text-lg font-semibold">{t('sessionExpired.title')}</h1>
        <p className="mt-2 text-sm leading-6 text-[rgb(var(--app-muted))]">
          {t('sessionExpired.description')}
        </p>
      </section>
    </main>
  );
}
