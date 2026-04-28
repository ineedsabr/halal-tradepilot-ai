import { useTranslation } from 'react-i18next';

type DisclaimerBannerProps = {
  type: 'analysis' | 'halal' | 'risk' | 'general';
};

export function DisclaimerBanner({ type }: DisclaimerBannerProps) {
  const { t } = useTranslation();

  return (
    <aside className="rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] px-3 py-2 text-xs leading-5 text-[rgb(var(--app-muted))]">
      {t(`disclaimer.${type}`)}
    </aside>
  );
}
