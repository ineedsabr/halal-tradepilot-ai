import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { BottomNav } from './components/layout/BottomNav';
import { TopBar } from './components/layout/TopBar';
import { EmptyState } from './components/states/EmptyState';
import { ErrorState } from './components/states/ErrorState';
import { SkeletonLoader } from './components/states/SkeletonLoader';
import { TelegramProvider } from './providers/TelegramProvider';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <AppShell topBar={<TopBar />} bottomNav={<BottomNav />}>
          <div className="grid gap-4">
            <EmptyState />
            <ErrorState />
            <SkeletonLoader />
          </div>
        </AppShell>
      </TelegramProvider>
    </QueryClientProvider>
  );
}
