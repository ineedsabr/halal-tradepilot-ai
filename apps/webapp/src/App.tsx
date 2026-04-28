import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppShell } from './components/layout/AppShell';
import { BottomNav, type NavItem } from './components/layout/BottomNav';
import { TopBar } from './components/layout/TopBar';
import { ErrorState } from './components/states/ErrorState';
import { SkeletonLoader } from './components/states/SkeletonLoader';
import { HalalScreenerScreen } from './features/halal/HalalScreenerScreen';
import { HomeScreen } from './features/home/HomeScreen';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { RiskCalculatorScreen } from './features/risk/RiskCalculatorScreen';
import { SettingsPanel } from './features/settings/SettingsPanel';
import { VerdictPreviewScreen } from './features/verdict/VerdictPreviewScreen';
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
  const [activeItem, setActiveItem] = useState<NavItem>('home');
  const [isVerdictPreviewOpen, setIsVerdictPreviewOpen] = useState(false);

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

  useEffect(() => {
    const language = i18n.resolvedLanguage ?? i18n.language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language, i18n.resolvedLanguage]);

  function handleSettingsSaved(nextSettings: UserSettings) {
    if (accessToken) {
      queryClientContext.setQueryData(['me-settings', accessToken], nextSettings);
    }
    void i18n.changeLanguage(nextSettings.language);
    setThemeMode(nextSettings.theme);
  }

  function handleNavigation(nextItem: NavItem) {
    setIsVerdictPreviewOpen(false);
    setActiveItem(nextItem);
  }

  function renderScreen() {
    if (isVerdictPreviewOpen) {
      return <VerdictPreviewScreen onBack={() => setIsVerdictPreviewOpen(false)} />;
    }

    if (activeItem === 'home') {
      return <HomeScreen onNavigate={handleNavigation} onOpenVerdictPreview={() => setIsVerdictPreviewOpen(true)} />;
    }

    if (activeItem === 'watchlist') {
      return <WatchlistScreen />;
    }

    if (activeItem === 'check') {
      return <HalalScreenerScreen />;
    }

    if (activeItem === 'risk') {
      return <RiskCalculatorScreen />;
    }

    if (activeItem === 'settings') {
      return <SettingsPanel accessToken={accessToken} settings={settings} onSaved={handleSettingsSaved} />;
    }

    return <HomeScreen onNavigate={handleNavigation} onOpenVerdictPreview={() => setIsVerdictPreviewOpen(true)} />;
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
    <AppShell topBar={<TopBar />} bottomNav={<BottomNav activeItem={activeItem} onChange={handleNavigation} />}>
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
