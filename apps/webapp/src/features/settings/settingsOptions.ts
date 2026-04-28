import type { UserSettings, UserSettingsUpdate } from '../../lib/api';

export type SettingsFormValues = Pick<
  UserSettings,
  | 'language'
  | 'theme'
  | 'level'
  | 'goal'
  | 'methodology'
  | 'risk_profile'
  | 'demo_deposit'
  | 'notifications_enabled'
>;

export const LANGUAGE_OPTIONS: UserSettings['language'][] = ['en', 'ru', 'de'];
export const THEME_OPTIONS: UserSettings['theme'][] = ['telegram', 'light', 'dark'];
export const LEVEL_OPTIONS: UserSettings['level'][] = ['learner', 'trader', 'pro'];
export const GOAL_OPTIONS: UserSettings['goal'][] = ['learn', 'invest', 'trade'];
export const METHODOLOGY_OPTIONS: UserSettings['methodology'][] = [
  'conservative',
  'balanced',
  'scholar_based',
  'custom',
];
export const RISK_PROFILE_OPTIONS: UserSettings['risk_profile'][] = ['conservative', 'moderate', 'active'];

export function settingsToFormValues(settings: UserSettings): SettingsFormValues {
  return {
    language: settings.language,
    theme: settings.theme,
    level: settings.level,
    goal: settings.goal,
    methodology: settings.methodology,
    risk_profile: settings.risk_profile,
    demo_deposit: settings.demo_deposit,
    notifications_enabled: settings.notifications_enabled,
  };
}

export function formValuesToUpdate(values: SettingsFormValues): UserSettingsUpdate {
  return {
    language: values.language,
    theme: values.theme,
    level: values.level,
    goal: values.goal,
    methodology: values.methodology,
    risk_profile: values.risk_profile,
    demo_deposit: values.demo_deposit,
    notifications_enabled: values.notifications_enabled,
  };
}
