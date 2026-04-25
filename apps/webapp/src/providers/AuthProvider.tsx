import { useMutation } from '@tanstack/react-query';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SessionExpiredState } from '../components/states/SessionExpiredState';
import { authenticateTelegram } from '../lib/api';
import { useTheme } from './TelegramProvider';

type AuthContextValue = {
  accessToken: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const { telegramWebApp } = useTheme();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const initData = telegramWebApp?.initData;

  const { isError, mutate } = useMutation({
    mutationFn: authenticateTelegram,
    onSuccess: (response) => {
      setAccessToken(response.access_token);
    },
  });

  useEffect(() => {
    if (initData) {
      mutate(initData);
    }
  }, [initData, mutate]);

  const value = useMemo(() => ({ accessToken }), [accessToken]);

  if (isError) {
    return <SessionExpiredState />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
