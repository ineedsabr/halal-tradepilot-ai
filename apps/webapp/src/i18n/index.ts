import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const resources = {
  en: {
    translation: {
      app: {
        telegramMiniApp: 'Telegram Mini App',
      },
      empty: {
        title: 'Coming soon',
        description: 'Coming soon',
      },
      error: {
        title: 'Coming soon',
        description: 'Coming soon',
      },
      loading: 'Loading',
      sessionExpired: {
        title: 'Session expired',
        description: 'Please reopen the Mini App from Telegram.',
      },
      nav: {
        home: 'Home',
        check: 'Check',
        risk: 'Risk',
        paper: 'Paper',
        settings: 'Settings',
      },
      settings: {
        language: 'Language',
        theme: 'Theme',
      },
      theme: {
        dark: 'Dark',
        light: 'Light',
        telegram: 'Telegram',
      },
    },
  },
  ru: {
    translation: {
      app: {
        telegramMiniApp: 'Telegram Mini App',
      },
      empty: {
        title: 'Скоро',
        description: 'Скоро',
      },
      error: {
        title: 'Скоро',
        description: 'Скоро',
      },
      loading: 'Загрузка',
      sessionExpired: {
        title: 'Сессия истекла',
        description: 'Пожалуйста, откройте Mini App заново из Telegram.',
      },
      nav: {
        home: 'Главная',
        check: 'Проверка',
        risk: 'Риск',
        paper: 'Paper',
        settings: 'Настройки',
      },
      settings: {
        language: 'Язык',
        theme: 'Тема',
      },
      theme: {
        dark: 'Тёмная',
        light: 'Светлая',
        telegram: 'Telegram',
      },
    },
  },
  de: {
    translation: {
      app: {
        telegramMiniApp: 'Telegram Mini App',
      },
      empty: {
        title: 'Demnaechst',
        description: 'Demnaechst',
      },
      error: {
        title: 'Demnaechst',
        description: 'Demnaechst',
      },
      loading: 'Laden',
      sessionExpired: {
        title: 'Sitzung abgelaufen',
        description: 'Bitte oeffne die Mini App erneut aus Telegram.',
      },
      nav: {
        home: 'Home',
        check: 'Check',
        risk: 'Risk',
        paper: 'Paper',
        settings: 'Einstellungen',
      },
      settings: {
        language: 'Sprache',
        theme: 'Theme',
      },
      theme: {
        dark: 'Dunkel',
        light: 'Hell',
        telegram: 'Telegram',
      },
    },
  },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
