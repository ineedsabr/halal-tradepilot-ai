import { useTranslation } from 'react-i18next';

export function ErrorState() {
  const { t } = useTranslation();

  return (
    <section className="rounded-lg border border-red-300 bg-red-50 p-5 text-red-950 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p className="m-0 text-sm font-medium">{t('error.title')}</p>
      <p className="mt-2 text-sm leading-6 opacity-80">{t('error.description')}</p>
    </section>
  );
}
