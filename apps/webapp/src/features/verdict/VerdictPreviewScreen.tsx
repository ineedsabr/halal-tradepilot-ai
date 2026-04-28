import { useTranslation } from 'react-i18next';
import { MizanLogo } from '../../components/brand/MizanLogo';
import { DisclaimerBanner } from '../../components/trust/DisclaimerBanner';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusPill } from '../../components/ui/StatusPill';
import { TrustBadge } from '../../components/ui/TrustBadge';

type VerdictPreviewScreenProps = {
  onBack: () => void;
};

const VERDICTS = [
  'STRONG_STUDY',
  'WATCH',
  'WAIT',
  'CAUTION',
  'AVOID',
  'NO_TRADE',
  'INSUFFICIENT_DATA',
] as const;

const REPORT_ITEMS = [
  'verdict.report.halal',
  'verdict.report.instrument',
  'verdict.report.risk',
  'verdict.report.market',
  'verdict.report.sources',
  'verdict.report.avoid',
];

function verdictTone(verdict: (typeof VERDICTS)[number]) {
  if (verdict === 'STRONG_STUDY' || verdict === 'WATCH') return 'positive';
  if (verdict === 'WAIT' || verdict === 'CAUTION' || verdict === 'INSUFFICIENT_DATA') return 'warning';
  return 'danger';
}

export function VerdictPreviewScreen({ onBack }: VerdictPreviewScreenProps) {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <PremiumCard className="overflow-hidden p-0">
        <div className="border-b border-[rgb(var(--app-border))] bg-[linear-gradient(135deg,rgb(var(--app-surface))_0%,rgb(var(--app-bg))_62%,rgb(var(--app-surface))_100%)] p-5">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 rounded-full border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] px-3 py-2 text-xs font-semibold text-[rgb(var(--app-muted))]"
          >
            {t('verdict.back')}
          </button>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] text-[rgb(var(--app-text))] shadow-[0_18px_38px_rgba(4,120,87,0.13)]">
              <MizanLogo size={46} />
            </div>
            <SectionHeader
              eyebrow={t('verdict.screen.eyebrow')}
              title={t('verdict.screen.title')}
              description={t('verdict.screen.description')}
            />
          </div>
        </div>

        <div className="grid gap-3 p-5">
          <div className="rounded-[1.35rem] border border-dashed border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--app-muted))]">
              {t('verdict.search.eyebrow')}
            </p>
            <p className="m-0 mt-2 text-lg font-semibold text-[rgb(var(--app-text))]">
              {t('verdict.search.placeholder')}
            </p>
            <p className="m-0 mt-2 text-sm leading-6 text-[rgb(var(--app-muted))]">
              {t('verdict.search.description')}
            </p>
          </div>
          <DisclaimerBanner type="analysis" />
        </div>
      </PremiumCard>

      <PremiumCard>
        <SectionHeader
          eyebrow={t('verdict.statuses.eyebrow')}
          title={t('verdict.statuses.title')}
          description={t('verdict.statuses.description')}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {VERDICTS.map((verdict) => (
            <StatusPill
              key={verdict}
              tone={verdictTone(verdict)}
              value={t(`verdict.labels.${verdict}`)}
            />
          ))}
        </div>
      </PremiumCard>

      <PremiumCard>
        <SectionHeader
          eyebrow={t('verdict.meanings.eyebrow')}
          title={t('verdict.meanings.title')}
        />
        <div className="mt-4 grid gap-3">
          {VERDICTS.map((verdict) => (
            <div
              key={verdict}
              className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3"
            >
              <StatusPill tone={verdictTone(verdict)} value={t(`verdict.labels.${verdict}`)} />
              <p className="m-0 mt-2 text-sm leading-6 text-[rgb(var(--app-muted))]">
                {t(`verdict.meanings.${verdict}`)}
              </p>
            </div>
          ))}
        </div>
      </PremiumCard>

      <PremiumCard>
        <SectionHeader
          eyebrow={t('verdict.report.eyebrow')}
          title={t('verdict.report.title')}
          description={t('verdict.report.description')}
        />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {REPORT_ITEMS.map((item) => (
            <TrustBadge key={item} label={t(item)} />
          ))}
        </div>
      </PremiumCard>
    </main>
  );
}
