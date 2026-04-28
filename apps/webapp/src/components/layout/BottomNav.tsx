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
    <nav className="sticky bottom-0 border-t border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] px-3 py-2">
      <div className="grid grid-cols-5 gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item;

          return (
            <button
              key={item}
              type="button"
              className={[
                'rounded-md px-1 py-2 text-[11px] font-medium transition sm:text-xs',
                isActive
                  ? 'bg-[rgb(var(--app-accent))] text-white'
                  : 'text-[rgb(var(--app-muted))] hover:bg-[rgb(var(--app-bg))]',
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
