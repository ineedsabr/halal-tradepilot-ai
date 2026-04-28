import { useTranslation } from 'react-i18next';

const NAV_ITEMS = ['home', 'check', 'watchlist', 'risk', 'settings'] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

type BottomNavProps = {
  activeItem: NavItem;
  onChange: (item: NavItem) => void;
};

export function BottomNav({ activeItem, onChange }: BottomNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="sticky bottom-0 z-10 bg-[linear-gradient(180deg,transparent_0%,rgb(var(--app-bg)/0.94)_42%,rgb(var(--app-bg))_100%)] px-4 pb-4 pt-3">
      <div className="grid grid-cols-5 gap-1 rounded-[2rem] border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface)/0.94)] p-1.5 shadow-[0_18px_48px_rgba(17,24,39,0.14)] backdrop-blur-xl dark:shadow-[0_18px_54px_rgba(0,0,0,0.46)]">
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item;

          return (
            <button
              key={item}
              type="button"
              className={[
                'min-h-12 rounded-[1.55rem] px-1 py-2 text-[10px] font-bold tracking-normal transition sm:text-[11px]',
                isActive
                  ? 'bg-[rgb(var(--app-primary)/0.12)] text-[rgb(var(--app-primary))]'
                  : 'text-[rgb(var(--app-muted))] hover:bg-[rgb(var(--app-bg)/0.82)]',
              ].join(' ')}
              onClick={() => onChange(item)}
            >
              {t(`nav.${item}`)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
