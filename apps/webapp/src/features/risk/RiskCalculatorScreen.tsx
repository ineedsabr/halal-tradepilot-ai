import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { DisclaimerBanner } from '../../components/trust/DisclaimerBanner';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusPill } from '../../components/ui/StatusPill';
import { calculateRisk, type RiskCalculationResponse } from '../../lib/api';

type RiskFormState = {
  deposit: string;
  entryPrice: string;
  stopLoss: string;
  targetValue: string;
  riskPercent: string;
};

type FieldKey = keyof RiskFormState;

const INITIAL_FORM: RiskFormState = {
  deposit: '',
  entryPrice: '',
  stopLoss: '',
  targetValue: '',
  riskPercent: '',
};

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return 'n/a';
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 6,
  }).format(value);
}

function verdictTone(verdict: RiskCalculationResponse['verdict']) {
  if (verdict === 'ALLOWED') return 'positive';
  if (verdict === 'CAUTION') return 'warning';
  if (verdict === 'BLOCKED') return 'danger';
  return 'neutral';
}

function validateForm(form: RiskFormState, t: (key: string) => string) {
  const errors: Partial<Record<FieldKey, string>> = {};
  const deposit = parseNumber(form.deposit);
  const entryPrice = parseNumber(form.entryPrice);
  const stopLoss = parseNumber(form.stopLoss);
  const targetValue = parseNumber(form.targetValue);
  const riskPercent = parseNumber(form.riskPercent);

  if (deposit === null) errors.deposit = t('risk.validation.requiredNumber');
  if (entryPrice === null) errors.entryPrice = t('risk.validation.requiredNumber');
  if (stopLoss === null) errors.stopLoss = t('risk.validation.requiredNumber');
  if (riskPercent === null) errors.riskPercent = t('risk.validation.requiredNumber');
  if (form.targetValue.trim() && targetValue === null) {
    errors.targetValue = t('risk.validation.optionalNumber');
  }

  if (deposit !== null && deposit <= 0) errors.deposit = t('risk.validation.positive');
  if (entryPrice !== null && entryPrice <= 0) errors.entryPrice = t('risk.validation.positive');
  if (stopLoss !== null && stopLoss <= 0) errors.stopLoss = t('risk.validation.positive');
  if (riskPercent !== null && riskPercent <= 0) errors.riskPercent = t('risk.validation.positive');
  if (targetValue !== null && targetValue <= 0) errors.targetValue = t('risk.validation.positive');

  return {
    errors,
    values:
      deposit !== null && entryPrice !== null && stopLoss !== null && riskPercent !== null
        ? {
            deposit,
            entry_price: entryPrice,
            stop_loss: stopLoss,
            take_profit: targetValue,
            risk_percent: riskPercent,
          }
        : null,
  };
}

function NumberField({
  id,
  label,
  value,
  placeholder,
  helper,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  helper?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[rgb(var(--app-text))]" htmlFor={id}>
      {label}
      <input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] px-3 text-base font-normal text-[rgb(var(--app-text))] outline-none focus:border-[rgb(var(--app-primary))]"
      />
      {helper ? <span className="text-xs font-normal text-[rgb(var(--app-muted))]">{helper}</span> : null}
      {error ? <span className="text-xs font-normal text-rose-700 dark:text-rose-300">{error}</span> : null}
    </label>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3">
      <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">{label}</dt>
      <dd className="m-0 mt-1 text-lg font-semibold text-[rgb(var(--app-text))]">{value}</dd>
    </div>
  );
}

function RiskResultCard({ result }: { result: RiskCalculationResponse }) {
  const { t } = useTranslation();
  const reasons = result.reasons.length > 0 ? result.reasons : [t('risk.result.noReasons')];

  return (
    <PremiumCard>
      <div className="flex flex-col gap-3">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--app-muted))]">{t('risk.result.backendResult')}</p>
        <StatusPill
          tone={verdictTone(result.verdict)}
          value={t(`risk.verdict.${result.verdict}`)}
        />
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ResultMetric label={t('risk.result.riskAmount')} value={formatNumber(result.risk_amount)} />
        <ResultMetric label={t('risk.result.maxLoss')} value={formatNumber(result.max_loss)} />
        <ResultMetric label={t('risk.result.stopDistance')} value={formatNumber(result.stop_distance)} />
        <ResultMetric label={t('risk.result.positionSize')} value={formatNumber(result.position_size)} />
        <ResultMetric label={t('risk.result.riskReward')} value={formatNumber(result.risk_reward)} />
      </dl>

      <div className="mt-4 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3">
        <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">{t('risk.result.reasons')}</p>
        <ul className="m-0 mt-2 grid gap-2 p-0 text-sm text-[rgb(var(--app-text))]">
          {reasons.map((reason) => (
            <li key={reason} className="list-none">
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid gap-2">
        <DisclaimerBanner type="risk" />
        <p className="m-0 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-xs leading-5 text-[rgb(var(--app-muted))]">
          {result.educational_disclaimer}
        </p>
      </div>
    </PremiumCard>
  );
}

export function RiskCalculatorScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState<RiskFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const riskMutation = useMutation({
    mutationFn: calculateRisk,
  });

  function updateField(field: FieldKey, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    riskMutation.reset();
  }

  function submitCalculation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validated = validateForm(form, t);
    setErrors(validated.errors);
    if (!validated.values || Object.keys(validated.errors).length > 0) return;
    riskMutation.mutate(validated.values);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <PremiumCard>
        <SectionHeader
          eyebrow={t('risk.screen.eyebrow')}
          title={t('risk.screen.title')}
          description={t('risk.screen.description')}
        />
      </PremiumCard>

      <PremiumCard>
        <form className="grid gap-4" onSubmit={submitCalculation}>
          <NumberField
            id="risk-deposit"
            label={t('risk.form.deposit')}
            value={form.deposit}
            placeholder={t('risk.form.amountPlaceholder')}
            error={errors.deposit}
            onChange={(value) => updateField('deposit', value)}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              id="risk-entry-price"
              label={t('risk.form.entryPrice')}
              value={form.entryPrice}
              placeholder={t('risk.form.numberPlaceholder')}
              error={errors.entryPrice}
              onChange={(value) => updateField('entryPrice', value)}
            />
            <NumberField
              id="risk-stop-loss"
              label={t('risk.form.stopLoss')}
              value={form.stopLoss}
              placeholder={t('risk.form.numberPlaceholder')}
              error={errors.stopLoss}
              onChange={(value) => updateField('stopLoss', value)}
            />
          </div>
          <NumberField
            id="risk-target-value"
            label={t('risk.form.targetValue')}
            value={form.targetValue}
            placeholder={t('risk.form.optionalNumberPlaceholder')}
            helper={t('risk.form.targetHelper')}
            error={errors.targetValue}
            onChange={(value) => updateField('targetValue', value)}
          />
          <NumberField
            id="risk-percent"
            label={t('risk.form.riskPercent')}
            value={form.riskPercent}
            placeholder={t('risk.form.percentPlaceholder')}
            helper={t('risk.form.riskPercentHelper')}
            error={errors.riskPercent}
            onChange={(value) => updateField('riskPercent', value)}
          />

          <button
            type="submit"
            disabled={riskMutation.isPending}
            className="min-h-12 rounded-2xl bg-[rgb(var(--app-primary))] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(4,120,87,0.2)] disabled:opacity-50"
          >
            {riskMutation.isPending ? t('risk.form.calculating') : t('risk.form.calculate')}
          </button>
        </form>
      </PremiumCard>

      {riskMutation.isError ? (
        <PremiumCard className="border-rose-200 bg-rose-50 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
          {(riskMutation.error as Error).message}
        </PremiumCard>
      ) : null}

      {riskMutation.data ? <RiskResultCard result={riskMutation.data} /> : null}
    </main>
  );
}
