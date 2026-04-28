import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { DisclaimerBanner } from '../../components/trust/DisclaimerBanner';
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
  if (verdict === 'ALLOWED') return 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100';
  if (verdict === 'CAUTION') return 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100';
  if (verdict === 'BLOCKED') return 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100';
  return 'border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] text-[rgb(var(--app-text))]';
}

function verdictIcon(verdict: RiskCalculationResponse['verdict']) {
  if (verdict === 'ALLOWED') return 'OK';
  if (verdict === 'CAUTION') return '!';
  if (verdict === 'BLOCKED') return 'X';
  return 'i';
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
        className="min-h-11 rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] px-3 text-base font-normal text-[rgb(var(--app-text))] outline-none focus:border-[rgb(var(--app-primary))]"
      />
      {helper ? <span className="text-xs font-normal text-[rgb(var(--app-muted))]">{helper}</span> : null}
      {error ? <span className="text-xs font-normal text-rose-700 dark:text-rose-300">{error}</span> : null}
    </label>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] p-3">
      <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">{label}</dt>
      <dd className="m-0 mt-1 text-lg font-semibold text-[rgb(var(--app-text))]">{value}</dd>
    </div>
  );
}

function RiskResultCard({ result }: { result: RiskCalculationResponse }) {
  const { t } = useTranslation();
  const reasons = result.reasons.length > 0 ? result.reasons : [t('risk.result.noReasons')];

  return (
    <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">{t('risk.result.backendResult')}</p>
        <p className={`m-0 inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${verdictTone(result.verdict)}`}>
          <span aria-hidden>{verdictIcon(result.verdict)}</span>
          <span>{t(`risk.verdict.${result.verdict}`)}</span>
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ResultMetric label={t('risk.result.riskAmount')} value={formatNumber(result.risk_amount)} />
        <ResultMetric label={t('risk.result.maxLoss')} value={formatNumber(result.max_loss)} />
        <ResultMetric label={t('risk.result.stopDistance')} value={formatNumber(result.stop_distance)} />
        <ResultMetric label={t('risk.result.positionSize')} value={formatNumber(result.position_size)} />
        <ResultMetric label={t('risk.result.riskReward')} value={formatNumber(result.risk_reward)} />
      </dl>

      <div className="mt-4 rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] p-3">
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
        <p className="m-0 rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] p-3 text-xs leading-5 text-[rgb(var(--app-muted))]">
          {result.educational_disclaimer}
        </p>
      </div>
    </section>
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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
        <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">{t('risk.screen.eyebrow')}</p>
        <h1 className="m-0 mt-1 text-2xl font-semibold text-[rgb(var(--app-text))]">{t('risk.screen.title')}</h1>
        <p className="m-0 mt-2 text-sm leading-6 text-[rgb(var(--app-muted))]">{t('risk.screen.description')}</p>
      </section>

      <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
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
            className="min-h-11 rounded-xl bg-[rgb(var(--app-primary))] px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {riskMutation.isPending ? t('risk.form.calculating') : t('risk.form.calculate')}
          </button>
        </form>
      </section>

      {riskMutation.isError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
          {(riskMutation.error as Error).message}
        </section>
      ) : null}

      {riskMutation.data ? <RiskResultCard result={riskMutation.data} /> : null}
    </main>
  );
}
