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
      onboarding: {
        eyebrow: 'Step {{current}} of {{total}}',
        back: 'Back',
        next: 'Next',
        finish: 'Finish',
        saving: 'Saving',
        steps: {
          0: {
            title: 'Choose language and theme',
            description: 'These preferences are saved to your account settings.',
          },
          1: {
            title: 'Set your learning profile',
            description: 'This helps shape educational wording only. It does not enable advice or automation.',
          },
          2: {
            title: 'Confirm preferences and consents',
            description: 'Finish is available after all required consent checkboxes are accepted.',
          },
        },
        consent: {
          disclaimer: 'I understand this app provides educational screening only and does not issue religious rulings.',
          terms: 'I accept the current terms.',
          privacy: 'I accept the current privacy notice.',
        },
      },
      settings: {
        language: 'Language',
        theme: 'Theme',
      },
      settingsPanel: {
        eyebrow: 'Settings',
        title: 'Onboarding settings',
        description: 'Update saved preferences. Consent timestamps are preserved by the backend.',
        authRequired: 'Open the Mini App through Telegram to manage account settings.',
        save: 'Save settings',
        saving: 'Saving',
        saved: 'Settings saved.',
        methodologyNote:
          'Only conservative currently maps to the backend bootstrap methodology. Other choices are saved as preferences for future methodology work.',
        fields: {
          language: 'Language',
          theme: 'Theme',
          level: 'Experience level',
          goal: 'Goal',
          methodology: 'Methodology preference',
          riskProfile: 'Risk profile',
          demoDeposit: 'Demo deposit',
          notifications: 'Notifications enabled',
          maxRisk: 'Backend max risk value',
        },
        consents: {
          title: 'Accepted consents',
          disclaimer: 'Disclaimer',
          terms: 'Terms',
          privacy: 'Privacy',
        },
        options: {
          language: {
            en: 'English',
            ru: 'Russian',
            de: 'German',
          },
          level: {
            learner: 'Learner',
            trader: 'Practitioner',
            pro: 'Advanced',
          },
          goal: {
            learn: 'Learn',
            invest: 'Long-term investing education',
            trade: 'Practice planning',
          },
          methodology: {
            conservative: 'Conservative',
            balanced: 'Balanced',
            scholar_based: 'Scholar-based',
            custom: 'Custom',
          },
          riskProfile: {
            conservative: 'Conservative',
            moderate: 'Moderate',
            active: 'Active',
          },
        },
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
      onboarding: {
        eyebrow: 'Шаг {{current}} из {{total}}',
        back: 'Назад',
        next: 'Далее',
        finish: 'Завершить',
        saving: 'Сохранение',
        steps: {
          0: {
            title: 'Выберите язык и тему',
            description: 'Эти предпочтения сохраняются в настройках аккаунта.',
          },
          1: {
            title: 'Настройте образовательный профиль',
            description: 'Это влияет только на образовательные формулировки. Советы и автоматизация не включаются.',
          },
          2: {
            title: 'Подтвердите настройки и согласия',
            description: 'Завершение доступно после принятия всех обязательных согласий.',
          },
        },
        consent: {
          disclaimer: 'Я понимаю, что приложение даёт только образовательный скрининг и не выносит религиозные решения.',
          terms: 'Я принимаю текущие условия.',
          privacy: 'Я принимаю текущее уведомление о приватности.',
        },
      },
      settings: {
        language: 'Язык',
        theme: 'Тема',
      },
      settingsPanel: {
        eyebrow: 'Настройки',
        title: 'Настройки онбординга',
        description: 'Обновите сохранённые предпочтения. Время принятых согласий сохраняется backend.',
        authRequired: 'Откройте Mini App через Telegram, чтобы управлять настройками аккаунта.',
        save: 'Сохранить настройки',
        saving: 'Сохранение',
        saved: 'Настройки сохранены.',
        methodologyNote:
          'Сейчас только conservative связан с bootstrap-методологией backend. Остальные варианты сохраняются как предпочтения для будущей работы.',
        fields: {
          language: 'Язык',
          theme: 'Тема',
          level: 'Уровень опыта',
          goal: 'Цель',
          methodology: 'Предпочтение методологии',
          riskProfile: 'Профиль риска',
          demoDeposit: 'Демо-депозит',
          notifications: 'Уведомления включены',
          maxRisk: 'Значение max risk от backend',
        },
        consents: {
          title: 'Принятые согласия',
          disclaimer: 'Дисклеймер',
          terms: 'Условия',
          privacy: 'Приватность',
        },
        options: {
          language: {
            en: 'Английский',
            ru: 'Русский',
            de: 'Немецкий',
          },
          level: {
            learner: 'Ученик',
            trader: 'Практик',
            pro: 'Продвинутый',
          },
          goal: {
            learn: 'Учиться',
            invest: 'Образование для долгосрочного инвестирования',
            trade: 'Практика планирования',
          },
          methodology: {
            conservative: 'Консервативная',
            balanced: 'Balanced',
            scholar_based: 'Scholar-based',
            custom: 'Custom',
          },
          riskProfile: {
            conservative: 'Консервативный',
            moderate: 'Умеренный',
            active: 'Активный',
          },
        },
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
      onboarding: {
        eyebrow: 'Schritt {{current}} von {{total}}',
        back: 'Zurueck',
        next: 'Weiter',
        finish: 'Abschliessen',
        saving: 'Speichern',
        steps: {
          0: {
            title: 'Sprache und Theme waehlen',
            description: 'Diese Praeferenzen werden in deinen Kontoeinstellungen gespeichert.',
          },
          1: {
            title: 'Bildungsprofil festlegen',
            description: 'Dies beeinflusst nur die Bildungsformulierung. Es aktiviert keine Beratung oder Automatisierung.',
          },
          2: {
            title: 'Praeferenzen und Zustimmungen bestaetigen',
            description: 'Abschliessen ist moeglich, sobald alle erforderlichen Zustimmungen akzeptiert sind.',
          },
        },
        consent: {
          disclaimer: 'Ich verstehe, dass die App nur bildendes Screening bietet und keine religioesen Entscheidungen trifft.',
          terms: 'Ich akzeptiere die aktuellen Bedingungen.',
          privacy: 'Ich akzeptiere den aktuellen Datenschutzhinweis.',
        },
      },
      settings: {
        language: 'Sprache',
        theme: 'Theme',
      },
      settingsPanel: {
        eyebrow: 'Einstellungen',
        title: 'Onboarding-Einstellungen',
        description: 'Aktualisiere gespeicherte Praeferenzen. Zustimmungszeitpunkte bleiben im Backend erhalten.',
        authRequired: 'Oeffne die Mini App ueber Telegram, um Kontoeinstellungen zu verwalten.',
        save: 'Einstellungen speichern',
        saving: 'Speichern',
        saved: 'Einstellungen gespeichert.',
        methodologyNote:
          'Derzeit ist nur conservative mit der Backend-Bootstrap-Methodik verbunden. Andere Werte werden als Praeferenzen fuer spaetere Methodikarbeit gespeichert.',
        fields: {
          language: 'Sprache',
          theme: 'Theme',
          level: 'Erfahrungsniveau',
          goal: 'Ziel',
          methodology: 'Methodikpraeferenz',
          riskProfile: 'Risikoprofil',
          demoDeposit: 'Demo-Einzahlung',
          notifications: 'Benachrichtigungen aktiviert',
          maxRisk: 'Backend max risk Wert',
        },
        consents: {
          title: 'Akzeptierte Zustimmungen',
          disclaimer: 'Disclaimer',
          terms: 'Bedingungen',
          privacy: 'Datenschutz',
        },
        options: {
          language: {
            en: 'Englisch',
            ru: 'Russisch',
            de: 'Deutsch',
          },
          level: {
            learner: 'Lernend',
            trader: 'Praktiker',
            pro: 'Fortgeschritten',
          },
          goal: {
            learn: 'Lernen',
            invest: 'Bildung fuer langfristiges Investieren',
            trade: 'Planung ueben',
          },
          methodology: {
            conservative: 'Konservativ',
            balanced: 'Balanced',
            scholar_based: 'Scholar-based',
            custom: 'Custom',
          },
          riskProfile: {
            conservative: 'Konservativ',
            moderate: 'Moderat',
            active: 'Aktiv',
          },
        },
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
