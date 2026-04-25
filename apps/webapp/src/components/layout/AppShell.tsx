import { PropsWithChildren, ReactNode } from 'react';

type AppShellProps = PropsWithChildren<{
  topBar: ReactNode;
  bottomNav: ReactNode;
}>;

export function AppShell({ children, topBar, bottomNav }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[rgb(var(--app-bg))] text-[rgb(var(--app-text))]">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col">
        {topBar}
        <main className="flex-1 px-4 py-4">{children}</main>
        {bottomNav}
      </div>
    </div>
  );
}
