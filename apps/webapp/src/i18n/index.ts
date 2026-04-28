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
      halal: {
        assetFallback: 'Asset',
        screen: {
          eyebrow: 'Halal Screener',
          title: 'Check asset + instrument',
          description:
            'This tool shows educational screening from the backend. It does not issue religious rulings or investment advice.',
        },
        search: {
          label: 'Search asset',
          placeholder: 'BTC, AAPL, ETH...',
          action: 'Search',
          searching: 'Searching',
          empty: 'No assets found. Try another symbol or name.',
        },
        instrument: {
          label: 'Select instrument',
          loading: 'Loading instrument options...',
          placeholder: 'Choose instrument type',
          notRestricted: 'Instrument layer: not restricted. Final status still depends on the selected asset.',
        },
        check: {
          action: 'Run check',
          checking: 'Checking',
          empty: 'Select both an asset and an instrument to see the combined screening result.',
        },
        result: {
          backendResult: 'Backend result',
          asset: 'Asset',
          instrument: 'Instrument',
          combined: 'Combined',
          methodology: 'Methodology',
          confidence: 'Confidence',
          dataQuality: 'Data quality',
          dataFreshness: 'Data freshness',
          lastReviewed: 'Last reviewed',
          notAvailable: 'Not available',
          summary: 'Summary',
          blockingReason: 'Blocking reason',
        },
        status: {
          instrumentNotRestricted: 'Instrument layer: not restricted',
        },
        hints: {
          avoid: 'This combination should be avoided due to instrument or asset restrictions.',
          underReview: 'Assessment is under review. Please treat this as uncertain.',
          scholarlyDisagreement: 'Scholarly views differ on this case; avoid overconfidence.',
          doubtful: 'Status is doubtful; caution is advised while evidence is unclear.',
          insufficientData: 'There is not enough reliable data yet for a confident status.',
          sourceConflict: 'Sources conflict; this status remains uncertain until resolved.',
          default: 'Instrument layer is not restricted. The final status still depends on the asset assessment.',
        },
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
      halal: {
        assetFallback: 'Актив',
        screen: {
          eyebrow: 'Халяль-скрининг',
          title: 'Проверка актива и инструмента',
          description:
            'Инструмент показывает образовательную проверку с backend. Он не выносит религиозные решения и не даёт инвестиционных советов.',
        },
        search: {
          label: 'Поиск актива',
          placeholder: 'BTC, AAPL, ETH...',
          action: 'Искать',
          searching: 'Поиск',
          empty: 'Активы не найдены. Попробуйте другой символ или название.',
        },
        instrument: {
          label: 'Выберите инструмент',
          loading: 'Загрузка вариантов инструментов...',
          placeholder: 'Выберите тип инструмента',
          notRestricted: 'Уровень инструмента: не ограничен. Итоговый статус всё ещё зависит от выбранного актива.',
        },
        check: {
          action: 'Запустить проверку',
          checking: 'Проверка',
          empty: 'Выберите актив и инструмент, чтобы увидеть совмещённый результат проверки.',
        },
        result: {
          backendResult: 'Результат backend',
          asset: 'Актив',
          instrument: 'Инструмент',
          combined: 'Совмещённый',
          methodology: 'Методология',
          confidence: 'Уверенность',
          dataQuality: 'Качество данных',
          dataFreshness: 'Актуальность данных',
          lastReviewed: 'Последняя проверка',
          notAvailable: 'Нет данных',
          summary: 'Краткое описание',
          blockingReason: 'Причина ограничения',
        },
        status: {
          instrumentNotRestricted: 'Уровень инструмента: не ограничен',
        },
        hints: {
          avoid: 'Этой комбинации следует избегать из-за ограничения инструмента или актива.',
          underReview: 'Оценка находится на проверке. Относитесь к результату как к неопределённому.',
          scholarlyDisagreement: 'По этому случаю есть различия во мнениях учёных; не стоит делать уверенный вывод.',
          doubtful: 'Статус сомнительный; нужна осторожность, пока данные неясны.',
          insufficientData: 'Пока недостаточно надёжных данных для уверенного статуса.',
          sourceConflict: 'Источники противоречат друг другу; статус остаётся неопределённым до разрешения конфликта.',
          default: 'Уровень инструмента не ограничен. Итоговый статус всё ещё зависит от оценки актива.',
        },
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
      halal: {
        assetFallback: 'Asset',
        screen: {
          eyebrow: 'Halal-Screening',
          title: 'Asset und Instrument pruefen',
          description:
            'Dieses Werkzeug zeigt eine bildende Pruefung aus dem Backend. Es trifft keine religioesen Entscheidungen und gibt keine Anlageberatung.',
        },
        search: {
          label: 'Asset suchen',
          placeholder: 'BTC, AAPL, ETH...',
          action: 'Suchen',
          searching: 'Suche laeuft',
          empty: 'Keine Assets gefunden. Versuche ein anderes Symbol oder einen anderen Namen.',
        },
        instrument: {
          label: 'Instrument auswaehlen',
          loading: 'Instrumentoptionen werden geladen...',
          placeholder: 'Instrumenttyp auswaehlen',
          notRestricted: 'Instrumentenebene: nicht eingeschraenkt. Der Endstatus haengt weiter vom ausgewaehlten Asset ab.',
        },
        check: {
          action: 'Pruefung starten',
          checking: 'Pruefung laeuft',
          empty: 'Waehle ein Asset und ein Instrument aus, um das kombinierte Screening-Ergebnis zu sehen.',
        },
        result: {
          backendResult: 'Backend-Ergebnis',
          asset: 'Asset',
          instrument: 'Instrument',
          combined: 'Kombiniert',
          methodology: 'Methodik',
          confidence: 'Vertrauen',
          dataQuality: 'Datenqualitaet',
          dataFreshness: 'Datenaktualitaet',
          lastReviewed: 'Zuletzt geprueft',
          notAvailable: 'Nicht verfuegbar',
          summary: 'Zusammenfassung',
          blockingReason: 'Einschraenkungsgrund',
        },
        status: {
          instrumentNotRestricted: 'Instrumentenebene: nicht eingeschraenkt',
        },
        hints: {
          avoid: 'Diese Kombination sollte wegen Instrument- oder Asset-Einschraenkungen vermieden werden.',
          underReview: 'Die Bewertung wird geprueft. Behandle dieses Ergebnis als unsicher.',
          scholarlyDisagreement: 'Zu diesem Fall gibt es unterschiedliche Gelehrtenmeinungen; vermeide Uebergewissheit.',
          doubtful: 'Der Status ist zweifelhaft; Vorsicht ist angebracht, solange die Belege unklar sind.',
          insufficientData: 'Es gibt noch nicht genug verlaessliche Daten fuer einen sicheren Status.',
          sourceConflict: 'Quellen widersprechen sich; der Status bleibt bis zur Klaerung unsicher.',
          default: 'Die Instrumentenebene ist nicht eingeschraenkt. Der Endstatus haengt weiter von der Asset-Bewertung ab.',
        },
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
