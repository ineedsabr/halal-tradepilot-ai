import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { addWatchlistItem } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';

type WatchlistAddButtonProps = {
  assetId: string;
};

function watchlistErrorMessage(message: string, t: (key: string) => string) {
  if (message === 'Asset already in watchlist') return t('watchlist.alreadyAdded');
  if (message === 'Watchlist limit reached') return t('watchlist.limit');
  return message;
}

export function WatchlistAddButton({ assetId }: WatchlistAddButtonProps) {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!accessToken) {
        throw new Error(t('watchlist.authRequired'));
      }
      return addWatchlistItem(accessToken, assetId);
    },
    onSuccess: () => {
      if (accessToken) {
        void queryClient.invalidateQueries({ queryKey: ['watchlist', accessToken] });
      }
    },
  });

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !accessToken}
        className="min-h-11 w-full rounded-xl border border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] px-4 text-sm font-semibold text-[rgb(var(--app-text))] disabled:opacity-50"
      >
        {mutation.isPending ? t('watchlist.adding') : t('watchlist.add')}
      </button>

      {!accessToken ? (
        <p className="m-0 mt-2 text-xs text-[rgb(var(--app-muted))]">{t('watchlist.authRequired')}</p>
      ) : null}

      {mutation.isError ? (
        <p className="m-0 mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {watchlistErrorMessage((mutation.error as Error).message, t)}
        </p>
      ) : null}

      {mutation.isSuccess ? (
        <p className="m-0 mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          {t('watchlist.added')}
        </p>
      ) : null}
    </div>
  );
}
