import { PropsWithChildren, ReactNode } from 'react';
import { AppBackground } from './AppBackground';

type AppShellProps = PropsWithChildren<{
  topBar: ReactNode;
  bottomNav: ReactNode;
}>;

export function AppShell({ children, topBar, bottomNav }: AppShellProps) {
  return (
    <AppBackground>
      {topBar}
      <main className="flex-1 px-4 pb-6 pt-5">{children}</main>
      {bottomNav}
    </AppBackground>
  );
}
