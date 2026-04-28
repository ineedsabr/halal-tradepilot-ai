import { useTranslation } from 'react-i18next';
import { MizanLogo } from '../../components/brand/MizanLogo';
import { DisclaimerBanner } from '../../components/trust/DisclaimerBanner';
import type { NavItem } from '../../components/layout/BottomNav';

type HomeScreenProps = {
  onNavigate: (item: NavItem) => void;
};

type ActionItem = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  target?: NavItem;
};

const ACTIONS: ActionItem[] = [
  {
    key: 'analyze',
    titleKey: 'home.actions.analyze.title',
    descriptionKey: 'home.actions.analyze.description',
  },
  {
    key: 'check',
    titleKey: 'home.actions.check.title',
    descriptionKey: 'home.actions.check.description',
    target: 'check',
  },
  {
    key: 'risk',
    titleKey: 'home.actions.risk.title',
    descriptionKey: 'home.actions.risk.description',
    target: 'risk',
  },
  {
    key: 'watchlist',
    titleKey: 'home.actions.watchlist.title',
    descriptionKey: 'home.actions.watchlist.description',
    target: 'watchlist',
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

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <section className="overflow-hidden rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-5 shadow-sm">
        <div className="flex flex-col items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[rgb(var(--app-text))] dark:bg-emerald-950">
            <MizanLogo size={46} />
          </div>
          <div>
            <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
              {t('home.hero.eyebrow')}
            </p>
            <h1 className="m-0 mt-1 text-4xl font-semibold tracking-normal text-[rgb(var(--app-text))]">
              {t('home.hero.title')}
            </h1>
            <p className="m-0 mt-2 text-base font-medium leading-7 text-[rgb(var(--app-primary))]">
              {t('home.hero.tagline')}
            </p>
            <p className="m-0 mt-3 text-sm leading-6 text-[rgb(var(--app-muted))]">
              {t('home.hero.description')}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <DisclaimerBanner type="general" />
        </div>
      </section>

      <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
        <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
          {t('home.marketMood.eyebrow')}
        </p>
        <h2 className="m-0 mt-1 text-xl font-semibold text-[rgb(var(--app-text))]">
          {t('home.marketMood.title')}
        </h2>
        <p className="m-0 mt-2 text-sm leading-6 text-[rgb(var(--app-muted))]">
          {t('home.marketMood.description')}
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACTIONS.map((action) => {
          const isDisabled = !action.target;

          return (
            <button
              key={action.key}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (action.target) onNavigate(action.target);
              }}
              className={[
                'min-h-28 rounded-2xl border p-4 text-left shadow-sm transition',
                isDisabled
                  ? 'border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] text-[rgb(var(--app-muted))]'
                  : 'border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] text-[rgb(var(--app-text))] hover:border-[rgb(var(--app-primary))]',
              ].join(' ')}
            >
              <span className="block text-base font-semibold">{t(action.titleKey)}</span>
              <span className="mt-2 block text-sm leading-6 text-[rgb(var(--app-muted))]">
                {t(action.descriptionKey)}
              </span>
            </button>
          );
        })}
      </section>

      <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
        <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
          {t('home.how.eyebrow')}
        </p>
        <h2 className="m-0 mt-1 text-xl font-semibold text-[rgb(var(--app-text))]">
          {t('home.how.title')}
        </h2>
        <ol className="m-0 mt-4 grid gap-3 p-0">
          {WORKFLOW_STEPS.map((stepKey, index) => (
            <li key={stepKey} className="flex gap-3 rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] p-3 text-sm text-[rgb(var(--app-text))]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--app-primary))] text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="leading-6">{t(stepKey)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
        <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
          {t('home.mvp.eyebrow')}
        </p>
        <h2 className="m-0 mt-1 text-xl font-semibold text-[rgb(var(--app-text))]">
          {t('home.mvp.title')}
        </h2>
        <ul className="m-0 mt-4 grid gap-2 p-0 text-sm text-[rgb(var(--app-muted))]">
          {MVP_NOTES.map((noteKey) => (
            <li key={noteKey} className="list-none rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] p-3">
              {t(noteKey)}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
