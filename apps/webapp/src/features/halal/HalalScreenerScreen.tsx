import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  checkHalal,
  listInstruments,
  searchAssets,
  type AssetSummary,
  type HalalCheckResult,
  type InstrumentSummary,
} from '../../lib/api';

const METHODOLOGY = 'mvp_conservative_bootstrap';

type StatusTone = 'ok' | 'warn' | 'avoid' | 'neutral';

function getTone(status: string): StatusTone {
  if (status === 'HALAL') return 'ok';
  if (status === 'AVOID') return 'avoid';
  if (status === 'DOUBTFUL' || status === 'UNDER_REVIEW' || status === 'SCHOLARLY_DISAGREEMENT') {
    return 'warn';
  }
  return 'neutral';
}

function statusIcon(tone: StatusTone) {
  if (tone === 'avoid') return '⛔';
  if (tone === 'warn') return '⚠️';
  if (tone === 'ok') return '✅';
  return 'ℹ️';
}

function displayStatus(label: string, status: string) {
  if (label === 'Instrument' && status === 'HALAL') {
    return 'HALAL — not restricted type';
  }
  return status;
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  const tone = getTone(status);
  const toneClass =
    tone === 'ok'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100'
      : tone === 'avoid'
        ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100'
        : tone === 'warn'
          ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100'
          : 'border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] text-[rgb(var(--app-text))]';

  return (
    <p className={`m-0 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs font-semibold ${toneClass}`}>
      <span aria-hidden>{statusIcon(tone)}</span>
      <span>
        {label}: {displayStatus(label, status)}
      </span>
    </p>
  );
}

function CombinedStatusHint({ status }: { status: string }) {
  if (status === 'AVOID') {
    return <p className="m-0 text-sm">This combination should be avoided due to instrument or asset restrictions.</p>;
  }
  if (status === 'UNDER_REVIEW') {
    return <p className="m-0 text-sm">Assessment is under review. Please treat this as uncertain.</p>;
  }
  if (status === 'SCHOLARLY_DISAGREEMENT') {
    return <p className="m-0 text-sm">Scholarly views differ on this case; avoid overconfidence.</p>;
  }
  if (status === 'DOUBTFUL') {
    return <p className="m-0 text-sm">Status is doubtful; caution is advised while evidence is unclear.</p>;
  }
  if (status === 'INSUFFICIENT_DATA') {
    return <p className="m-0 text-sm">There is not enough reliable data yet for a confident status.</p>;
  }
  if (status === 'SOURCE_CONFLICT') {
    return <p className="m-0 text-sm">Sources conflict; this status remains uncertain until resolved.</p>;
  }
  return <p className="m-0 text-sm">Instrument layer is not restricted. The final status still depends on the asset assessment.</p>;
}

function formatDate(value?: string | null) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
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
  return (
    <button
      type="button"
      onClick={() => onSelect(asset)}
      className={`w-full rounded-xl border p-3 text-left transition ${
        isSelected
          ? 'border-[rgb(var(--app-primary))] bg-[rgb(var(--app-primary)/0.08)]'
          : 'border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))]'
      }`}
    >
      <span className="block text-sm font-semibold text-[rgb(var(--app-text))]">
        {asset.symbol} · {asset.name}
      </span>
      <span className="mt-1 block text-xs text-[rgb(var(--app-muted))]">
        {[asset.asset_type, asset.exchange, asset.currency].filter(Boolean).join(' · ') || 'Asset'}
      </span>
    </button>
  );
}

function ResultCard({ result }: { result: HalalCheckResult }) {
  return (
    <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">Backend result</p>
        <h2 className="m-0 text-xl font-semibold text-[rgb(var(--app-text))]">
          {result.asset.symbol} + {result.instrument.code}
        </h2>
        <p className="m-0 text-sm text-[rgb(var(--app-muted))]">
          {result.asset.name} · {result.instrument.name}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge label="Asset" status={result.asset_status} />
        <StatusBadge label="Instrument" status={result.instrument_status} />
        <StatusBadge label="Combined" status={result.combined_status} />
      </div>

      <div className="mt-4 rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] p-3 text-[rgb(var(--app-text))]">
        <CombinedStatusHint status={result.combined_status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">Methodology</dt>
          <dd className="m-0 text-[rgb(var(--app-text))]">{result.methodology}</dd>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">Confidence</dt>
            <dd className="m-0 text-[rgb(var(--app-text))]">{result.confidence}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">Data quality</dt>
            <dd className="m-0 text-[rgb(var(--app-text))]">{result.data_quality_status}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">Data freshness</dt>
            <dd className="m-0 text-[rgb(var(--app-text))]">{result.data_freshness_status}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">Last reviewed</dt>
            <dd className="m-0 text-[rgb(var(--app-text))]">{formatDate(result.last_reviewed_at)}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-4">
        <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">Summary</p>
        <p className="m-0 mt-1 text-sm text-[rgb(var(--app-text))]">{result.summary}</p>
      </div>

      {result.blocking_reason ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
          <p className="m-0 font-semibold">Blocking reason</p>
          <p className="m-0 mt-1">{result.blocking_reason}</p>
        </div>
      ) : null}

      <p className="m-0 mt-4 rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] p-3 text-xs leading-5 text-[rgb(var(--app-muted))]">
        {result.disclaimer}
      </p>
    </section>
  );
}

export function HalalScreenerScreen() {
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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
        <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">Halal Screener</p>
        <h1 className="m-0 mt-1 text-2xl font-semibold text-[rgb(var(--app-text))]">Check asset + instrument</h1>
        <p className="m-0 mt-2 text-sm leading-6 text-[rgb(var(--app-muted))]">
          This tool shows educational screening from the backend. It does not issue religious rulings or trading advice.
        </p>
      </section>

      <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
        <form className="flex flex-col gap-3" onSubmit={submitSearch}>
          <label className="text-sm font-semibold text-[rgb(var(--app-text))]" htmlFor="asset-search">
            Search asset
          </label>
          <div className="flex gap-2">
            <input
              id="asset-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="BTC, AAPL, ETH..."
              className="min-h-11 flex-1 rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] px-3 text-base text-[rgb(var(--app-text))] outline-none focus:border-[rgb(var(--app-primary))]"
            />
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-[rgb(var(--app-primary))] px-4 text-sm font-semibold text-white disabled:opacity-50"
              disabled={searchMutation.isPending}
            >
              {searchMutation.isPending ? 'Searching' : 'Search'}
            </button>
          </div>
        </form>

        {searchMutation.isError ? (
          <p className="m-0 mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950">
            {(searchMutation.error as Error).message}
          </p>
        ) : null}

        {searchMutation.isSuccess && assets.length === 0 ? (
          <p className="m-0 mt-3 rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] p-3 text-sm text-[rgb(var(--app-muted))]">
            No assets found. Try another symbol or name.
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
      </section>

      <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
        <label className="text-sm font-semibold text-[rgb(var(--app-text))]" htmlFor="instrument-select">
          Select instrument
        </label>

        {instrumentsQuery.isLoading ? (
          <p className="m-0 mt-3 text-sm text-[rgb(var(--app-muted))]">Loading instrument options...</p>
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
            className="mt-3 min-h-11 w-full rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] px-3 text-base text-[rgb(var(--app-text))] outline-none focus:border-[rgb(var(--app-primary))]"
          >
            <option value="">Choose instrument type</option>
            {instrumentsQuery.data.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.code} · {instrument.name}
              </option>
            ))}
          </select>
        ) : null}

        {selectedInstrument?.is_absolute_restriction ? (
          <p className="m-0 mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
            {selectedInstrument.restriction_reason}
          </p>
        ) : selectedInstrument ? (
          <p className="m-0 mt-3 rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] p-3 text-sm text-[rgb(var(--app-muted))]">
            Instrument layer: not restricted. Final status still depends on the selected asset.
          </p>
        ) : null}

        <button
          type="button"
          onClick={runCheck}
          disabled={!selectedAsset || !selectedInstrumentId || checkMutation.isPending}
          className="mt-4 min-h-11 w-full rounded-xl bg-[rgb(var(--app-primary))] px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {checkMutation.isPending ? 'Checking' : 'Run check'}
        </button>
      </section>

      {!selectedAsset || !selectedInstrumentId ? (
        <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 text-sm text-[rgb(var(--app-muted))]">
          Select both an asset and an instrument to see the combined screening result.
        </section>
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
