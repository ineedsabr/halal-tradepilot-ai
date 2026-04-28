import { useTranslation } from 'react-i18next';
import { MizanLogo } from '../../components/brand/MizanLogo';
import { DisclaimerBanner } from '../../components/trust/DisclaimerBanner';
import { ActionCard } from '../../components/ui/ActionCard';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusPill } from '../../components/ui/StatusPill';
import { TrustBadge } from '../../components/ui/TrustBadge';
import type { NavItem } from '../../components/layout/BottomNav';

type HomeScreenProps = {
  onNavigate: (item: NavItem) => void;
  onOpenVerdictPreview: () => void;
};

type ActionItem = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  metaKey?: string;
  target?: NavItem;
  icon: string;
};

const ACTIONS: ActionItem[] = [
  {
    key: 'check',
    titleKey: 'home.actions.check.title',
    descriptionKey: 'home.actions.check.description',
    target: 'check',
    icon: 'HC',
  },
  {
    key: 'risk',
    titleKey: 'home.actions.risk.title',
    descriptionKey: 'home.actions.risk.description',
    target: 'risk',
    icon: 'R',
  },
  {
    key: 'watchlist',
    titleKey: 'home.actions.watchlist.title',
    descriptionKey: 'home.actions.watchlist.description',
    target: 'watchlist',
    icon: 'S',
  },
];

const WORKFLOW_STEPS = [
  'home.how.steps.asset',
  'home.how.steps.instrument',
  'home.how.steps.review',
  'home.how.steps.decide',
];

const MVP_NOTES = [
  'home.mvp.conservative',
  'home.mvp.watchlist',
  'home.mvp.risk',
  'home.mvp.next',
];

const VERDICT_LABELS = [
  'STRONG_STUDY',
  'WATCH',
  'WAIT',
  'CAUTION',
  'AVOID',
  'NO_TRADE',
  'INSUFFICIENT_DATA',
] as const;

const AVOID_ITEMS = [
  'home.avoid.futures',
  'home.avoid.margin',
  'home.avoid.leverage',
  'home.avoid.yield',
  'home.avoid.speculation',
];

function verdictTone(verdict: (typeof VERDICT_LABELS)[number]) {
  if (verdict === 'STRONG_STUDY' || verdict === 'WATCH') return 'positive';
  if (verdict === 'WAIT' || verdict === 'CAUTION' || verdict === 'INSUFFICIENT_DATA') return 'warning';
  return 'danger';
}

export function HomeScreen({ onNavigate, onOpenVerdictPreview }: HomeScreenProps) {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <PremiumCard className="overflow-hidden p-0">
        <div className="border-b border-[rgb(var(--app-border))] bg-[linear-gradient(135deg,rgb(var(--app-surface))_0%,rgb(var(--app-bg))_58%,rgb(var(--app-surface))_100%)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.55rem] border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] text-[rgb(var(--app-text))] shadow-[0_18px_38px_rgba(4,120,87,0.13)]">
              <MizanLogo size={58} />
            </div>
            <StatusPill value={t('home.hero.comingNext')} tone="gold" />
          </div>

          <div className="mt-5">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--app-muted))]">
              {t('home.hero.eyebrow')}
            </p>
            <h1 className="m-0 mt-2 text-4xl font-semibold tracking-normal text-[rgb(var(--app-text))]">
              {t('home.hero.title')}
            </h1>
            <p className="m-0 mt-3 max-w-sm text-lg font-semibold leading-7 text-[rgb(var(--app-primary))]">
              {t('home.hero.tagline')}
            </p>
            <p className="m-0 mt-3 text-sm leading-6 text-[rgb(var(--app-muted))]">
              {t('home.hero.description')}
            </p>
          </div>
        </div>

        <div className="grid gap-3 p-5">
          <button
            type="button"
            onClick={onOpenVerdictPreview}
            className="min-h-16 rounded-[1.35rem] border border-[rgb(var(--app-primary)/0.18)] bg-[rgb(var(--app-primary))] px-4 text-left text-sm font-semibold text-white shadow-[0_16px_34px_rgba(4,120,87,0.26)]"
          >
            <span className="block text-xs uppercase tracking-[0.16em] text-white/70">
              {t('home.ask.eyebrow')}
            </span>
            <span className="mt-1 block text-base">
              {t('home.ask.placeholder')}
            </span>
          </button>
          <div className="grid grid-cols-3 gap-2">
            <TrustBadge label={t('home.trust.halal')} value={t('home.trust.educational')} />
            <TrustBadge label={t('home.trust.risk')} value={t('home.trust.backend')} />
            <TrustBadge label={t('home.trust.market')} value={t('home.trust.next')} />
          </div>
          <DisclaimerBanner type="general" />
        </div>
      </PremiumCard>

      <PremiumCard>
        <SectionHeader
          eyebrow={t('home.verdicts.eyebrow')}
          title={t('home.verdicts.title')}
          description={t('home.verdicts.description')}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {VERDICT_LABELS.map((verdict) => (
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
          eyebrow={t('home.marketMood.eyebrow')}
          title={t('home.marketMood.title')}
          description={t('home.marketMood.description')}
        />
      </PremiumCard>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACTIONS.map((action) => {
          return (
            <ActionCard
              key={action.key}
              title={t(action.titleKey)}
              description={t(action.descriptionKey)}
              meta={action.metaKey ? t(action.metaKey) : undefined}
              icon={<span className="text-xs font-bold">{action.icon}</span>}
              onClick={() => {
                if (action.target) onNavigate(action.target);
              }}
            />
          );
        })}
      </section>

      <PremiumCard>
        <SectionHeader eyebrow={t('home.avoid.eyebrow')} title={t('home.avoid.title')} description={t('home.avoid.description')} />
        <div className="mt-4 grid gap-2">
          {AVOID_ITEMS.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-sm font-semibold text-[rgb(var(--app-text))]"
            >
              {t(item)}
            </div>
          ))}
        </div>
      </PremiumCard>

      <PremiumCard>
        <SectionHeader eyebrow={t('home.how.eyebrow')} title={t('home.how.title')} />
        <ol className="m-0 mt-4 grid gap-3 p-0">
          {WORKFLOW_STEPS.map((stepKey, index) => (
            <li key={stepKey} className="flex gap-3 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-sm text-[rgb(var(--app-text))]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--app-primary))] text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="leading-6">{t(stepKey)}</span>
            </li>
          ))}
        </ol>
      </PremiumCard>

      <PremiumCard>
        <SectionHeader eyebrow={t('home.mvp.eyebrow')} title={t('home.mvp.title')} />
        <ul className="m-0 mt-4 grid gap-2 p-0 text-sm text-[rgb(var(--app-muted))]">
          {MVP_NOTES.map((noteKey) => (
            <li key={noteKey} className="list-none rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3">
              {t(noteKey)}
            </li>
          ))}
        </ul>
      </PremiumCard>
    </main>
  );
}
