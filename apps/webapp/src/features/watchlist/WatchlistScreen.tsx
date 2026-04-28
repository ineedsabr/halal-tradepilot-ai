import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
    <article className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
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
          className="min-h-9 shrink-0 rounded-xl border border-[rgb(var(--app-border))] px-3 text-xs font-semibold text-[rgb(var(--app-text))] disabled:opacity-50"
        >
          {isRemoving ? t('watchlist.removing') : t('watchlist.remove')}
        </button>
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
            {t('watchlist.status')}
          </dt>
          <dd className="m-0 text-[rgb(var(--app-text))]">
            {item.current_status ?? t('halal.result.notAvailable')}
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
    </article>
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
      <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 text-sm text-[rgb(var(--app-muted))]">
        {t('watchlist.authRequired')}
      </section>
    );
  }

  const items = watchlistQuery.data ?? [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 shadow-sm">
        <p className="m-0 text-xs uppercase tracking-wide text-[rgb(var(--app-muted))]">
          {t('watchlist.eyebrow')}
        </p>
        <h1 className="m-0 mt-1 text-2xl font-semibold text-[rgb(var(--app-text))]">
          {t('watchlist.title')}
        </h1>
        <p className="m-0 mt-2 text-sm leading-6 text-[rgb(var(--app-muted))]">
          {t('watchlist.description')}
        </p>
      </section>

      {watchlistQuery.isLoading ? (
        <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 text-sm text-[rgb(var(--app-muted))]">
          {t('watchlist.loading')}
        </section>
      ) : null}

      {watchlistQuery.isError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
          {(watchlistQuery.error as Error).message}
        </section>
      ) : null}

      {items.length >= WATCHLIST_LIMIT ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {t('watchlist.limit')}
        </section>
      ) : null}

      {watchlistQuery.isSuccess && items.length === 0 ? (
        <section className="rounded-2xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-surface))] p-4 text-sm text-[rgb(var(--app-muted))]">
          {t('watchlist.empty')}
        </section>
      ) : null}

      {removeMutation.isError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
          {(removeMutation.error as Error).message}
        </section>
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
