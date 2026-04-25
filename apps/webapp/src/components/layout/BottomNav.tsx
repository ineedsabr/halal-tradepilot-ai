import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = ['home', 'check', 'risk', 'paper', 'settings'] as const;

export function BottomNav() {
  const { t } = useTranslation();
  const [activeItem, setActiveItem] = useState<(typeof NAV_ITEMS)[number]>('home');

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
                'rounded-md px-2 py-2 text-xs transition',
                isActive
                  ? 'bg-[rgb(var(--app-accent))] text-white'
                  : 'text-[rgb(var(--app-muted))] hover:bg-[rgb(var(--app-bg))]',
              ].join(' ')}
              onClick={() => setActiveItem(item)}
            >
              {t(`nav.${item}`)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
