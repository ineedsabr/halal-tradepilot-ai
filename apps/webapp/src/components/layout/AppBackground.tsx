import type { PropsWithChildren } from 'react';

export function AppBackground({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[rgb(var(--app-bg))] text-[rgb(var(--app-text))]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(var(--app-surface),0.96)_0%,rgba(var(--app-bg),1)_36%,rgba(var(--app-bg),1)_100%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col">
        {children}
      </div>
    </div>
  );
}
