import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusPill } from '../../components/ui/StatusPill';
import { listWatchlist, removeWatchlistItem, type WatchlistItem } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';

const WATCHLIST_LIMIT = 5;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function WatchlistCard({ item, onRemove, isRemoving }: {
  item: WatchlistItem;
  onRemove: (watchlistItemId: string) => void;
  isRemoving: boolean;
}) {
  const { t } = useTranslation();

  return (
    <PremiumCard as="article">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-lg font-semibold text-[rgb(var(--app-text))]">
            {item.symbol} · {item.name}
          </h2>
          <p className="m-0 mt-1 text-xs text-[rgb(var(--app-muted))]">
            {[item.asset_type, item.exchange, item.currency].filter(Boolean).join(' · ')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.watchlist_item_id)}
          disabled={isRemoving}
          className="min-h-9 shrink-0 rounded-full border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg)/0.72)] px-3 text-xs font-semibold text-[rgb(var(--app-text))] disabled:opacity-50"
        >
          {isRemoving ? t('watchlist.removing') : t('watchlist.remove')}
        </button>
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
            {t('watchlist.status')}
          </dt>
          <dd className="m-0 mt-1">
            <StatusPill
              tone={item.current_status === 'AVOID' ? 'danger' : item.current_status ? 'warning' : 'neutral'}
              value={item.current_status ?? t('halal.result.notAvailable')}
            />
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
              {t('halal.result.confidence')}
            </dt>
            <dd className="m-0 text-[rgb(var(--app-text))]">
              {item.confidence ?? t('halal.result.notAvailable')}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
              {t('halal.result.dataFreshness')}
            </dt>
            <dd className="m-0 text-[rgb(var(--app-text))]">
              {item.data_freshness_status ?? t('halal.result.notAvailable')}
            </dd>
          </div>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
            {t('watchlist.addedAt')}
          </dt>
          <dd className="m-0 text-[rgb(var(--app-text))]">{formatDate(item.created_at)}</dd>
        </div>
      </dl>
    </PremiumCard>
  );
}

export function WatchlistScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const watchlistQuery = useQuery({
    queryKey: ['watchlist', accessToken],
    queryFn: () => listWatchlist(accessToken!),
    enabled: Boolean(accessToken),
  });

  const removeMutation = useMutation({
    mutationFn: (watchlistItemId: string) => {
      if (!accessToken) {
        throw new Error(t('watchlist.authRequired'));
      }
      return removeWatchlistItem(accessToken, watchlistItemId);
    },
    onSuccess: () => {
      if (accessToken) {
        void queryClient.invalidateQueries({ queryKey: ['watchlist', accessToken] });
      }
    },
  });

  if (!accessToken) {
    return (
      <PremiumCard className="text-sm text-[rgb(var(--app-muted))]">
        {t('watchlist.authRequired')}
      </PremiumCard>
    );
  }

  const items = watchlistQuery.data ?? [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <PremiumCard>
        <SectionHeader
          eyebrow={t('watchlist.eyebrow')}
          title={t('watchlist.title')}
          description={t('watchlist.description')}
        />
      </PremiumCard>

      {watchlistQuery.isLoading ? (
        <PremiumCard className="text-sm text-[rgb(var(--app-muted))]">
          {t('watchlist.loading')}
        </PremiumCard>
      ) : null}

      {watchlistQuery.isError ? (
        <PremiumCard className="border-rose-200 bg-rose-50 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
          {(watchlistQuery.error as Error).message}
        </PremiumCard>
      ) : null}

      {items.length >= WATCHLIST_LIMIT ? (
        <PremiumCard className="border-amber-200 bg-amber-50 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {t('watchlist.limit')}
        </PremiumCard>
      ) : null}

      {watchlistQuery.isSuccess && items.length === 0 ? (
        <PremiumCard className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] text-sm font-semibold text-[rgb(var(--app-primary))]">
            SL
          </div>
          <p className="m-0 mt-3 text-sm leading-6 text-[rgb(var(--app-muted))]">
            {t('watchlist.empty')}
          </p>
        </PremiumCard>
      ) : null}

      {removeMutation.isError ? (
        <PremiumCard className="border-rose-200 bg-rose-50 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
          {(removeMutation.error as Error).message}
        </PremiumCard>
      ) : null}

      {items.length > 0 ? (
        <section className="grid gap-3">
          {items.map((item) => (
            <WatchlistCard
              key={item.watchlist_item_id}
              item={item}
              isRemoving={removeMutation.isPending}
              onRemove={(watchlistItemId) => removeMutation.mutate(watchlistItemId)}
            />
          ))}
        </section>
      ) : null}
    </main>
  );
}
