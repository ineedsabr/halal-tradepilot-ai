import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { DisclaimerBanner } from '../../components/trust/DisclaimerBanner';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusPill } from '../../components/ui/StatusPill';
import {
  checkHalal,
  listInstruments,
  searchAssets,
  type AssetSummary,
  type HalalCheckResult,
  type InstrumentSummary,
} from '../../lib/api';
import { WatchlistAddButton } from '../watchlist/WatchlistAddButton';

const METHODOLOGY = 'mvp_conservative_bootstrap';

type StatusTone = 'positive' | 'warning' | 'danger' | 'neutral';

function getTone(status: string): StatusTone {
  if (status === 'HALAL') return 'positive';
  if (status === 'AVOID') return 'danger';
  if (status === 'DOUBTFUL' || status === 'UNDER_REVIEW' || status === 'SCHOLARLY_DISAGREEMENT') {
    return 'warning';
  }
  return 'neutral';
}

function displayStatus(labelKey: string, status: string, t: (key: string) => string) {
  if (labelKey === 'halal.result.instrument' && status === 'HALAL') {
    return t('halal.status.instrumentNotRestricted');
  }
  return status;
}

function StatusBadge({ labelKey, status }: { labelKey: string; status: string }) {
  const { t } = useTranslation();
  return (
    <StatusPill
      label={t(labelKey)}
      tone={getTone(status)}
      value={displayStatus(labelKey, status, t)}
    />
  );
}

function CombinedStatusHint({ status }: { status: string }) {
  const { t } = useTranslation();

  if (status === 'AVOID') {
    return <p className="m-0 text-sm">{t('halal.hints.avoid')}</p>;
  }
  if (status === 'UNDER_REVIEW') {
    return <p className="m-0 text-sm">{t('halal.hints.underReview')}</p>;
  }
  if (status === 'SCHOLARLY_DISAGREEMENT') {
    return <p className="m-0 text-sm">{t('halal.hints.scholarlyDisagreement')}</p>;
  }
  if (status === 'DOUBTFUL') {
    return <p className="m-0 text-sm">{t('halal.hints.doubtful')}</p>;
  }
  if (status === 'INSUFFICIENT_DATA') {
    return <p className="m-0 text-sm">{t('halal.hints.insufficientData')}</p>;
  }
  if (status === 'SOURCE_CONFLICT') {
    return <p className="m-0 text-sm">{t('halal.hints.sourceConflict')}</p>;
  }
  return <p className="m-0 text-sm">{t('halal.hints.default')}</p>;
}

function formatDate(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString();
}

function AssetResultButton({
  asset,
  isSelected,
  onSelect,
}: {
  asset: AssetSummary;
  isSelected: boolean;
  onSelect: (asset: AssetSummary) => void;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => onSelect(asset)}
      className={`w-full rounded-2xl border p-3 text-left shadow-[0_10px_26px_rgba(15,23,18,0.04)] transition ${
        isSelected
          ? 'border-[rgb(var(--app-primary))] bg-[rgb(var(--app-primary)/0.08)]'
          : 'border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface)/0.9)] hover:border-[rgb(var(--app-primary))]'
      }`}
    >
      <span className="block text-sm font-semibold text-[rgb(var(--app-text))]">
        {asset.symbol} · {asset.name}
      </span>
      <span className="mt-1 block text-xs text-[rgb(var(--app-muted))]">
        {[asset.asset_type, asset.exchange, asset.currency].filter(Boolean).join(' · ') || t('halal.assetFallback')}
      </span>
    </button>
  );
}

function ResultCard({ result }: { result: HalalCheckResult }) {
  const { t } = useTranslation();

  return (
    <PremiumCard>
      <div className="flex flex-col gap-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--app-muted))]">{t('halal.result.backendResult')}</p>
        <h2 className="m-0 text-xl font-semibold text-[rgb(var(--app-text))]">
          {result.asset.symbol} + {result.instrument.code}
        </h2>
        <p className="m-0 text-sm text-[rgb(var(--app-muted))]">
          {result.asset.name} · {result.instrument.name}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge labelKey="halal.result.asset" status={result.asset_status} />
        <StatusBadge labelKey="halal.result.instrument" status={result.instrument_status} />
        <StatusBadge labelKey="halal.result.combined" status={result.combined_status} />
      </div>

      <div className="mt-4 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-[rgb(var(--app-text))]">
        <CombinedStatusHint status={result.combined_status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">{t('halal.result.methodology')}</dt>
          <dd className="m-0 text-[rgb(var(--app-text))]">{result.methodology}</dd>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">{t('halal.result.confidence')}</dt>
            <dd className="m-0 text-[rgb(var(--app-text))]">{result.confidence}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">{t('halal.result.dataQuality')}</dt>
            <dd className="m-0 text-[rgb(var(--app-text))]">{result.data_quality_status}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">{t('halal.result.dataFreshness')}</dt>
            <dd className="m-0 text-[rgb(var(--app-text))]">{result.data_freshness_status}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">{t('halal.result.lastReviewed')}</dt>
            <dd className="m-0 text-[rgb(var(--app-text))]">{formatDate(result.last_reviewed_at, t('halal.result.notAvailable'))}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-4">
        <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">{t('halal.result.summary')}</p>
        <p className="m-0 mt-1 text-sm text-[rgb(var(--app-text))]">{result.summary}</p>
      </div>

      {result.blocking_reason ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
          <p className="m-0 font-semibold">{t('halal.result.blockingReason')}</p>
          <p className="m-0 mt-1">{result.blocking_reason}</p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-2">
        <DisclaimerBanner type="halal" />
        <p className="m-0 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-xs leading-5 text-[rgb(var(--app-muted))]">
          {result.disclaimer}
        </p>
      </div>

      <WatchlistAddButton assetId={result.asset.id} />
    </PremiumCard>
  );
}

export function HalalScreenerScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<AssetSummary | null>(null);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState('');

  const instrumentsQuery = useQuery({
    queryKey: ['instruments'],
    queryFn: listInstruments,
  });

  const searchMutation = useMutation({
    mutationFn: searchAssets,
    onSuccess: (assets) => {
      if (assets.length === 0) {
        setSelectedAsset(null);
      }
    },
  });

  const checkMutation = useMutation({
    mutationFn: checkHalal,
  });

  const selectedInstrument = useMemo<InstrumentSummary | undefined>(
    () => instrumentsQuery.data?.find((instrument) => instrument.id === selectedInstrumentId),
    [instrumentsQuery.data, selectedInstrumentId],
  );

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    checkMutation.reset();
    searchMutation.mutate(query);
  }

  function runCheck() {
    if (!selectedAsset || !selectedInstrumentId) return;
    checkMutation.mutate({
      assetId: selectedAsset.id,
      instrumentId: selectedInstrumentId,
      methodology: METHODOLOGY,
    });
  }

  const assets = searchMutation.data ?? [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <PremiumCard>
        <SectionHeader
          eyebrow={t('halal.screen.eyebrow')}
          title={t('halal.screen.title')}
          description={t('halal.screen.description')}
        />
      </PremiumCard>

      <PremiumCard>
        <form className="flex flex-col gap-3" onSubmit={submitSearch}>
          <label className="text-sm font-semibold text-[rgb(var(--app-text))]" htmlFor="asset-search">
            {t('halal.search.label')}
          </label>
          <div className="flex gap-2">
            <input
              id="asset-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('halal.search.placeholder')}
              className="min-h-12 flex-1 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] px-3 text-base text-[rgb(var(--app-text))] outline-none focus:border-[rgb(var(--app-primary))]"
            />
            <button
              type="submit"
              className="min-h-12 rounded-2xl bg-[rgb(var(--app-primary))] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(4,120,87,0.2)] disabled:opacity-50"
              disabled={searchMutation.isPending}
            >
              {searchMutation.isPending ? t('halal.search.searching') : t('halal.search.action')}
            </button>
          </div>
        </form>

        {searchMutation.isError ? (
          <p className="m-0 mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950">
            {(searchMutation.error as Error).message}
          </p>
        ) : null}

        {searchMutation.isSuccess && assets.length === 0 ? (
          <p className="m-0 mt-3 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-sm text-[rgb(var(--app-muted))]">
            {t('halal.search.empty')}
          </p>
        ) : null}

        {assets.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {assets.map((asset) => (
              <AssetResultButton
                key={asset.id}
                asset={asset}
                isSelected={selectedAsset?.id === asset.id}
                onSelect={(nextAsset) => {
                  setSelectedAsset(nextAsset);
                  checkMutation.reset();
                }}
              />
            ))}
          </div>
        ) : null}
      </PremiumCard>

      <PremiumCard>
        <label className="text-sm font-semibold text-[rgb(var(--app-text))]" htmlFor="instrument-select">
          {t('halal.instrument.label')}
        </label>

        {instrumentsQuery.isLoading ? (
          <p className="m-0 mt-3 text-sm text-[rgb(var(--app-muted))]">{t('halal.instrument.loading')}</p>
        ) : null}

        {instrumentsQuery.isError ? (
          <p className="m-0 mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950">
            {(instrumentsQuery.error as Error).message}
          </p>
        ) : null}

        {instrumentsQuery.data ? (
          <select
            id="instrument-select"
            value={selectedInstrumentId}
            onChange={(event) => {
              setSelectedInstrumentId(event.target.value);
              checkMutation.reset();
            }}
            className="mt-3 min-h-12 w-full rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] px-3 text-base text-[rgb(var(--app-text))] outline-none focus:border-[rgb(var(--app-primary))]"
          >
            <option value="">{t('halal.instrument.placeholder')}</option>
            {instrumentsQuery.data.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.code} · {instrument.name}
              </option>
            ))}
          </select>
        ) : null}

        {selectedInstrument?.is_absolute_restriction ? (
          <p className="m-0 mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
            {selectedInstrument.restriction_reason}
          </p>
        ) : selectedInstrument ? (
          <p className="m-0 mt-3 rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] p-3 text-sm text-[rgb(var(--app-muted))]">
            {t('halal.instrument.notRestricted')}
          </p>
        ) : null}

        <button
          type="button"
          onClick={runCheck}
          disabled={!selectedAsset || !selectedInstrumentId || checkMutation.isPending}
          className="mt-4 min-h-12 w-full rounded-2xl bg-[rgb(var(--app-primary))] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(4,120,87,0.2)] disabled:opacity-50"
        >
          {checkMutation.isPending ? t('halal.check.checking') : t('halal.check.action')}
        </button>
      </PremiumCard>

      {!selectedAsset || !selectedInstrumentId ? (
        <PremiumCard className="text-sm text-[rgb(var(--app-muted))]">
          {t('halal.check.empty')}
        </PremiumCard>
      ) : null}

      {checkMutation.isError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">
          {(checkMutation.error as Error).message}
        </section>
      ) : null}

      {checkMutation.data ? <ResultCard result={checkMutation.data} /> : null}
    </main>
  );
}
