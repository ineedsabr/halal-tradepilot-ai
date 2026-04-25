type TelegramThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  secondary_bg_color?: string;
  button_color?: string;
};

export type TelegramWebApp = {
  colorScheme?: 'light' | 'dark';
  themeParams?: TelegramThemeParams;
  ready?: () => void;
  expand?: () => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

export function initTelegramWebApp(): TelegramWebApp | null {
  const webApp = getTelegramWebApp();

  webApp?.ready?.();
  webApp?.expand?.();

  return webApp;
}
