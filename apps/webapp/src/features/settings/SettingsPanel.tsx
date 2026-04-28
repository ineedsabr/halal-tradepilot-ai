import { useMutation } from '@tanstack/react-query';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { updateUserSettings, type UserSettings } from '../../lib/api';
import { useTheme } from '../../providers/TelegramProvider';
import {
  GOAL_OPTIONS,
  LANGUAGE_OPTIONS,
  LEVEL_OPTIONS,
  METHODOLOGY_OPTIONS,
  RISK_PROFILE_OPTIONS,
  SettingsFormValues,
  THEME_OPTIONS,
  formValuesToUpdate,
  settingsToFormValues,
} from './settingsOptions';

type SettingsPanelProps = {
  accessToken: string | null;
  settings: UserSettings | null;
  onSaved: (settings: UserSettings) => void;
};

function formatDate(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString();
}

function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  labelPrefix,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: readonly T[];
  labelPrefix: string;
  onChange: (value: T) => void;
}) {
  const { t } = useTranslation();

  return (
    <label className="grid gap-2 text-sm font-semibold text-[rgb(var(--app-text))]" htmlFor={id}>
      {label}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="min-h-12 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] px-3 text-base font-normal text-[rgb(var(--app-text))]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {t(`${labelPrefix}.${option}`)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SettingsPanel({ accessToken, settings, onSaved }: SettingsPanelProps) {
  const { i18n, t } = useTranslation();
  const { setThemeMode } = useTheme();
  const [values, setValues] = useState<SettingsFormValues | null>(() =>
    settings ? settingsToFormValues(settings) : null,
  );

  useEffect(() => {
    setValues(settings ? settingsToFormValues(settings) : null);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (payload: SettingsFormValues) => {
      if (!accessToken) {
        throw new Error(t('settingsPanel.authRequired'));
      }
      return updateUserSettings(accessToken, formValuesToUpdate(payload));
    },
    onSuccess: (nextSettings) => {
      setValues(settingsToFormValues(nextSettings));
      void i18n.changeLanguage(nextSettings.language);
      setThemeMode(nextSettings.theme);
      onSaved(nextSettings);
    },
  });

  const updateValue = <Key extends keyof SettingsFormValues>(key: Key, value: SettingsFormValues[Key]) => {
    setValues((currentValues) => (currentValues ? { ...currentValues, [key]: value } : currentValues));
  };

  const updateDeposit = (event: ChangeEvent<HTMLInputElement>) => {
    updateValue('demo_deposit', Number(event.target.value));
  };

  function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values) return;
    mutation.mutate(values);
  }

  if (!settings || !values) {
    return (
      <PremiumCard className="text-sm text-[rgb(var(--app-muted))]">
        {t('settingsPanel.authRequired')}
      </PremiumCard>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <PremiumCard>
        <SectionHeader
          eyebrow={t('settingsPanel.eyebrow')}
          title={t('settingsPanel.title')}
          description={t('settingsPanel.description')}
        />
      </PremiumCard>

      <PremiumCard as="form" onSubmit={submitSettings}>
        <div className="grid gap-4">
          <SelectField
            id="settings-language"
            label={t('settingsPanel.fields.language')}
            labelPrefix="settingsPanel.options.language"
            options={LANGUAGE_OPTIONS}
            value={values.language}
            onChange={(value) => updateValue('language', value)}
          />
          <SelectField
            id="settings-theme"
            label={t('settingsPanel.fields.theme')}
            labelPrefix="theme"
            options={THEME_OPTIONS}
            value={values.theme}
            onChange={(value) => updateValue('theme', value)}
          />
          <SelectField
            id="settings-level"
            label={t('settingsPanel.fields.level')}
            labelPrefix="settingsPanel.options.level"
            options={LEVEL_OPTIONS}
            value={values.level}
            onChange={(value) => updateValue('level', value)}
          />
          <SelectField
            id="settings-goal"
            label={t('settingsPanel.fields.goal')}
            labelPrefix="settingsPanel.options.goal"
            options={GOAL_OPTIONS}
            value={values.goal}
            onChange={(value) => updateValue('goal', value)}
          />
          <SelectField
            id="settings-methodology"
            label={t('settingsPanel.fields.methodology')}
            labelPrefix="settingsPanel.options.methodology"
            options={METHODOLOGY_OPTIONS}
            value={values.methodology}
            onChange={(value) => updateValue('methodology', value)}
          />
          <p className="m-0 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-xs leading-5 text-[rgb(var(--app-muted))]">
            {t('settingsPanel.methodologyNote')}
          </p>
          <SelectField
            id="settings-risk-profile"
            label={t('settingsPanel.fields.riskProfile')}
            labelPrefix="settingsPanel.options.riskProfile"
            options={RISK_PROFILE_OPTIONS}
            value={values.risk_profile}
            onChange={(value) => updateValue('risk_profile', value)}
          />
          <label className="grid gap-2 text-sm font-semibold text-[rgb(var(--app-text))]" htmlFor="settings-deposit">
            {t('settingsPanel.fields.demoDeposit')}
            <input
              id="settings-deposit"
              type="number"
              min="100"
              max="10000000"
              value={values.demo_deposit}
              onChange={updateDeposit}
              className="min-h-12 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] px-3 text-base font-normal text-[rgb(var(--app-text))]"
            />
          </label>
          <label className="flex items-start gap-3 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-sm text-[rgb(var(--app-text))]">
            <input
              type="checkbox"
              checked={values.notifications_enabled}
              onChange={(event) => updateValue('notifications_enabled', event.target.checked)}
              className="mt-1"
            />
            <span>{t('settingsPanel.fields.notifications')}</span>
          </label>
        </div>

        <dl className="mt-5 grid gap-3 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
              {t('settingsPanel.fields.maxRisk')}
            </dt>
            <dd className="m-0 text-[rgb(var(--app-text))]">
              {(settings.max_risk_per_trade * 100).toFixed(1)}%
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
              {t('settingsPanel.consents.title')}
            </dt>
            <dd className="m-0 grid gap-1 text-[rgb(var(--app-text))]">
              <span>{t('settingsPanel.consents.disclaimer')}: {formatDate(settings.disclaimer_accepted_at, t('halal.result.notAvailable'))}</span>
              <span>{t('settingsPanel.consents.terms')}: {formatDate(settings.terms_accepted_at, t('halal.result.notAvailable'))}</span>
              <span>{t('settingsPanel.consents.privacy')}: {formatDate(settings.privacy_accepted_at, t('halal.result.notAvailable'))}</span>
            </dd>
          </div>
        </dl>

        {mutation.isError ? (
          <p className="m-0 mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
            {(mutation.error as Error).message}
          </p>
        ) : null}

        {mutation.isSuccess ? (
          <p className="m-0 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
            {t('settingsPanel.saved')}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-5 min-h-12 w-full rounded-2xl bg-[rgb(var(--app-primary))] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(4,120,87,0.2)] disabled:opacity-50"
        >
          {mutation.isPending ? t('settingsPanel.saving') : t('settingsPanel.save')}
        </button>
      </PremiumCard>
    </main>
  );
}
