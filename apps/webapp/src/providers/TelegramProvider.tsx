import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { initTelegramWebApp, TelegramWebApp } from '../lib/telegram';

export type ThemeMode = 'telegram' | 'light' | 'dark';

type ThemeContextValue = {
  telegramWebApp: TelegramWebApp | null;
  themeMode: ThemeMode;
  setThemeMode: (themeMode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_THEME_TOKENS = {
  light: {
    '--app-bg': '248 250 247',
    '--app-text': '24 32 28',
    '--app-muted': '91 104 96',
    '--app-surface': '255 255 255',
    '--app-border': '218 226 220',
    '--app-accent': '4 120 87',
    '--app-primary': '4 120 87',
  },
  dark: {
    '--app-bg': '15 20 18',
    '--app-text': '240 246 242',
    '--app-muted': '158 174 164',
    '--app-surface': '25 33 29',
    '--app-border': '55 69 61',
    '--app-accent': '52 211 153',
    '--app-primary': '52 211 153',
  },
};

function hexToRgb(value: string): string | null {
  const normalizedValue = value.replace('#', '');

  if (!/^[\da-f]{6}$/i.test(normalizedValue)) {
    return null;
  }

  const red = Number.parseInt(normalizedValue.slice(0, 2), 16);
  const green = Number.parseInt(normalizedValue.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedValue.slice(4, 6), 16);

  return `${red} ${green} ${blue}`;
}

function setCssVariable(name: string, value?: string) {
  if (!value) {
    return;
  }

  const rgb = hexToRgb(value);

  if (rgb) {
    document.documentElement.style.setProperty(name, rgb);
  }
}

function applyThemeTokens(theme: keyof typeof DEFAULT_THEME_TOKENS) {
  Object.entries(DEFAULT_THEME_TOKENS[theme]).forEach(([name, value]) => {
    document.documentElement.style.setProperty(name, value);
  });
}

export function TelegramProvider({ children }: PropsWithChildren) {
  const [telegramWebApp, setTelegramWebApp] = useState<TelegramWebApp | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('telegram');

  useEffect(() => {
    setTelegramWebApp(initTelegramWebApp());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const telegramTheme = telegramWebApp?.themeParams;
    const telegramColorScheme = telegramWebApp?.colorScheme ?? 'light';
    const effectiveTheme = themeMode === 'telegram' ? telegramColorScheme : themeMode;

    root.classList.toggle('dark', effectiveTheme === 'dark');
    root.dataset.theme = themeMode;
    applyThemeTokens(effectiveTheme);

    if (themeMode === 'telegram' && telegramTheme) {
      setCssVariable('--app-bg', telegramTheme.bg_color);
      setCssVariable('--app-text', telegramTheme.text_color);
      setCssVariable('--app-muted', telegramTheme.hint_color);
      setCssVariable('--app-surface', telegramTheme.secondary_bg_color);
      setCssVariable('--app-accent', telegramTheme.button_color);
      setCssVariable('--app-primary', telegramTheme.button_color);
    }
  }, [telegramWebApp, themeMode]);

  const value = useMemo(
    () => ({
      telegramWebApp,
      themeMode,
      setThemeMode,
    }),
    [telegramWebApp, themeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useTheme must be used within TelegramProvider');
  }

  return value;
}
