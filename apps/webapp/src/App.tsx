import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppShell } from './components/layout/AppShell';
import { BottomNav, type NavItem } from './components/layout/BottomNav';
import { TopBar } from './components/layout/TopBar';
import { ErrorState } from './components/states/ErrorState';
import { SkeletonLoader } from './components/states/SkeletonLoader';
import { HalalScreenerScreen } from './features/halal/HalalScreenerScreen';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { SettingsPanel } from './features/settings/SettingsPanel';
import { WatchlistScreen } from './features/watchlist/WatchlistScreen';
import { getUserSettings, type UserSettings } from './lib/api';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { TelegramProvider, useTheme } from './providers/TelegramProvider';

const queryClient = new QueryClient();

function AppContent() {
  const queryClientContext = useQueryClient();
  const { i18n } = useTranslation();
  const { accessToken, isAuthenticating } = useAuth();
  const { setThemeMode } = useTheme();
  const [activeItem, setActiveItem] = useState<NavItem>('check');

  const settingsQuery = useQuery({
    queryKey: ['me-settings', accessToken],
    queryFn: () => getUserSettings(accessToken!),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });

  const settings = settingsQuery.data ?? null;

  useEffect(() => {
    if (!settings) return;
    void i18n.changeLanguage(settings.language);
    setThemeMode(settings.theme);
  }, [i18n, setThemeMode, settings]);

  function handleSettingsSaved(nextSettings: UserSettings) {
    if (accessToken) {
      queryClientContext.setQueryData(['me-settings', accessToken], nextSettings);
    }
    void i18n.changeLanguage(nextSettings.language);
    setThemeMode(nextSettings.theme);
  }

  function renderScreen() {
    if (activeItem === 'watchlist') {
      return <WatchlistScreen />;
    }

    if (activeItem === 'check') {
      return <HalalScreenerScreen />;
    }

    if (activeItem === 'settings') {
      return <SettingsPanel accessToken={accessToken} settings={settings} onSaved={handleSettingsSaved} />;
    }

    return <HalalScreenerScreen />;
  }

  if (isAuthenticating || (accessToken && settingsQuery.isPending)) {
    return (
      <AppShell topBar={<TopBar />} bottomNav={null}>
        <SkeletonLoader />
      </AppShell>
    );
  }

  if (accessToken && settingsQuery.isError) {
    return (
      <AppShell topBar={<TopBar />} bottomNav={null}>
        <ErrorState />
      </AppShell>
    );
  }

  if (accessToken && settings && !settings.onboarding_completed) {
    return (
      <AppShell topBar={<TopBar />} bottomNav={null}>
        <OnboardingFlow accessToken={accessToken} settings={settings} onCompleted={handleSettingsSaved} />
      </AppShell>
    );
  }

  return (
    <AppShell topBar={<TopBar />} bottomNav={<BottomNav activeItem={activeItem} onChange={setActiveItem} />}>
      {renderScreen()}
    </AppShell>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TelegramProvider>
    </QueryClientProvider>
  );
}
