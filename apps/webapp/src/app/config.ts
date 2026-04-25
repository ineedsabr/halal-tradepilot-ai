export const APP_NAME = 'Halal TradePilot AI';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'de'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
