import { useMutation } from '@tanstack/react-query';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { updateUserSettings, type UserSettings, type UserSettingsUpdate } from '../../lib/api';
import { useTheme } from '../../providers/TelegramProvider';
import {
  GOAL_OPTIONS,
  LANGUAGE_OPTIONS,
  LEVEL_OPTIONS,
  METHODOLOGY_OPTIONS,
  RISK_PROFILE_OPTIONS,
  SettingsFormValues,
  THEME_OPTIONS,
  settingsToFormValues,
} from '../settings/settingsOptions';

type OnboardingFlowProps = {
  accessToken: string;
  settings: UserSettings;
  onCompleted: (settings: UserSettings) => void;
};

type ConsentState = {
  disclaimer: boolean;
  terms: boolean;
  privacy: boolean;
};

const LAST_STEP = 2;

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

export function OnboardingFlow({ accessToken, settings, onCompleted }: OnboardingFlowProps) {
  const { i18n, t } = useTranslation();
  const { setThemeMode } = useTheme();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<SettingsFormValues>(() => settingsToFormValues(settings));
  const [consents, setConsents] = useState<ConsentState>({
    disclaimer: false,
    terms: false,
    privacy: false,
  });

  const mutation = useMutation({
    mutationFn: (payload: UserSettingsUpdate) => updateUserSettings(accessToken, payload),
    onSuccess: (nextSettings) => {
      setValues(settingsToFormValues(nextSettings));
      void i18n.changeLanguage(nextSettings.language);
      setThemeMode(nextSettings.theme);

      if (step === LAST_STEP) {
        onCompleted(nextSettings);
        return;
      }

      setStep((currentStep) => currentStep + 1);
    },
  });

  const updateValue = <Key extends keyof SettingsFormValues>(key: Key, value: SettingsFormValues[Key]) => {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
  };

  const updateDeposit = (event: ChangeEvent<HTMLInputElement>) => {
    updateValue('demo_deposit', Number(event.target.value));
  };

  const canFinish = consents.disclaimer && consents.terms && consents.privacy;

  function submitStep() {
    if (step === 0) {
      mutation.mutate({ language: values.language, theme: values.theme });
      return;
    }

    if (step === 1) {
      mutation.mutate({
        level: values.level,
        goal: values.goal,
        methodology: values.methodology,
      });
      return;
    }

    if (!canFinish) return;

    mutation.mutate({
      risk_profile: values.risk_profile,
      demo_deposit: values.demo_deposit,
      notifications_enabled: values.notifications_enabled,
      disclaimer_accepted: true,
      terms_accepted: true,
      privacy_accepted: true,
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <PremiumCard>
        <SectionHeader
          eyebrow={t('onboarding.eyebrow', { current: step + 1, total: 3 })}
          title={t(`onboarding.steps.${step}.title`)}
          description={t(`onboarding.steps.${step}.description`)}
        />
      </PremiumCard>

      <PremiumCard>
        {step === 0 ? (
          <div className="grid gap-4">
            <SelectField
              id="onboarding-language"
              label={t('settingsPanel.fields.language')}
              labelPrefix="settingsPanel.options.language"
              options={LANGUAGE_OPTIONS}
              value={values.language}
              onChange={(value) => updateValue('language', value)}
            />
            <SelectField
              id="onboarding-theme"
              label={t('settingsPanel.fields.theme')}
              labelPrefix="theme"
              options={THEME_OPTIONS}
              value={values.theme}
              onChange={(value) => updateValue('theme', value)}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4">
            <SelectField
              id="onboarding-level"
              label={t('settingsPanel.fields.level')}
              labelPrefix="settingsPanel.options.level"
              options={LEVEL_OPTIONS}
              value={values.level}
              onChange={(value) => updateValue('level', value)}
            />
            <SelectField
              id="onboarding-goal"
              label={t('settingsPanel.fields.goal')}
              labelPrefix="settingsPanel.options.goal"
              options={GOAL_OPTIONS}
              value={values.goal}
              onChange={(value) => updateValue('goal', value)}
            />
            <SelectField
              id="onboarding-methodology"
              label={t('settingsPanel.fields.methodology')}
              labelPrefix="settingsPanel.options.methodology"
              options={METHODOLOGY_OPTIONS}
              value={values.methodology}
              onChange={(value) => updateValue('methodology', value)}
            />
            <p className="m-0 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-xs leading-5 text-[rgb(var(--app-muted))]">
              {t('settingsPanel.methodologyNote')}
            </p>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4">
            <SelectField
              id="onboarding-risk-profile"
              label={t('settingsPanel.fields.riskProfile')}
              labelPrefix="settingsPanel.options.riskProfile"
              options={RISK_PROFILE_OPTIONS}
              value={values.risk_profile}
              onChange={(value) => updateValue('risk_profile', value)}
            />
            <label className="grid gap-2 text-sm font-semibold text-[rgb(var(--app-text))]" htmlFor="onboarding-deposit">
              {t('settingsPanel.fields.demoDeposit')}
              <input
                id="onboarding-deposit"
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
            <div className="grid gap-2">
              {(['disclaimer', 'terms', 'privacy'] as const).map((key) => (
                <label
                  key={key}
                  className="flex items-start gap-3 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-sm text-[rgb(var(--app-text))]"
                >
                  <input
                    type="checkbox"
                    checked={consents[key]}
                    onChange={(event) => setConsents((current) => ({ ...current, [key]: event.target.checked }))}
                    className="mt-1"
                  />
                  <span>{t(`onboarding.consent.${key}`)}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {mutation.isError ? (
          <p className="m-0 mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
            {(mutation.error as Error).message}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
            disabled={step === 0 || mutation.isPending}
            className="min-h-12 flex-1 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] px-4 text-sm font-semibold text-[rgb(var(--app-text))] disabled:opacity-50"
          >
            {t('onboarding.back')}
          </button>
          <button
            type="button"
            onClick={submitStep}
            disabled={mutation.isPending || (step === LAST_STEP && !canFinish)}
            className="min-h-12 flex-1 rounded-2xl bg-[rgb(var(--app-primary))] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(4,120,87,0.2)] disabled:opacity-50"
          >
            {mutation.isPending ? t('onboarding.saving') : step === LAST_STEP ? t('onboarding.finish') : t('onboarding.next')}
          </button>
        </div>
      </PremiumCard>
    </main>
  );
}
