export const APP_NAME = 'Mizan';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'de', 'ar'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
