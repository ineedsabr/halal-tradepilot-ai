import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { BottomNav } from './components/layout/BottomNav';
import { TopBar } from './components/layout/TopBar';
import { HalalScreenerScreen } from './features/halal/HalalScreenerScreen';
import { AuthProvider } from './providers/AuthProvider';
import { TelegramProvider } from './providers/TelegramProvider';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <AuthProvider>
          <AppShell topBar={<TopBar />} bottomNav={<BottomNav />}>
            <HalalScreenerScreen />
          </AppShell>
        </AuthProvider>
      </TelegramProvider>
    </QueryClientProvider>
  );
}
