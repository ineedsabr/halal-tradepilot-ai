import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_NAME, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../app/config';
import { MizanLogo } from '../brand/MizanLogo';
import { ThemeMode, useTheme } from '../../providers/TelegramProvider';

const THEME_OPTIONS: ThemeMode[] = ['telegram', 'light', 'dark'];

export function TopBar() {
  const { i18n, t } = useTranslation();
  const { themeMode, setThemeMode } = useTheme();
  const selectedLanguage = SUPPORTED_LANGUAGES.includes(i18n.language as SupportedLanguage)
    ? (i18n.language as SupportedLanguage)
    : 'en';

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    void i18n.changeLanguage(event.target.value);
  };

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setThemeMode(event.target.value as ThemeMode);
  };

  return (
    <header className="sticky top-0 z-10 border-b border-[rgb(var(--app-border)/0.72)] bg-[rgb(var(--app-bg)/0.88)] px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] text-[rgb(var(--app-text))] shadow-[0_10px_24px_rgba(15,23,18,0.08)]">
            <MizanLogo size={24} />
          </div>
          <div className="min-w-0">
            <p className="m-0 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--app-muted))]">
              {t('app.tagline')}
            </p>
            <h1 className="m-0 truncate text-xl font-black tracking-normal">{APP_NAME}</h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <select
            aria-label={t('settings.language')}
            className="rounded-full border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] px-2 py-1 text-sm text-[rgb(var(--app-text))]"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            {SUPPORTED_LANGUAGES.map((language: SupportedLanguage) => (
              <option key={language} value={language}>
                {language.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            aria-label={t('settings.theme')}
            className="rounded-full border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] px-2 py-1 text-sm text-[rgb(var(--app-text))]"
            value={themeMode}
            onChange={handleThemeChange}
          >
            {THEME_OPTIONS.map((theme) => (
              <option key={theme} value={theme}>
                {t(`theme.${theme}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
