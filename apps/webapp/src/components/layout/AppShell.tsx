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
      <main className="flex-1 px-4 py-5">{children}</main>
      {bottomNav}
    </AppBackground>
  );
}
