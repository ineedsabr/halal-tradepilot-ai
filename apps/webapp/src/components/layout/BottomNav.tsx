import { useTranslation } from 'react-i18next';

const NAV_ITEMS = ['watchlist', 'check', 'risk', 'settings'] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

type BottomNavProps = {
  activeItem: NavItem;
  onChange: (item: NavItem) => void;
};

export function BottomNav({ activeItem, onChange }: BottomNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="sticky bottom-0 border-t border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] px-3 py-2">
      <div className="grid grid-cols-4 gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item;

          return (
            <button
              key={item}
              type="button"
              className={[
                'rounded-md px-2 py-2 text-xs transition',
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
