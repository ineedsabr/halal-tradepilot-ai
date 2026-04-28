import type { PropsWithChildren } from 'react';

export function AppBackground({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[rgb(var(--app-bg))] text-[rgb(var(--app-text))]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-12%,rgb(var(--app-primary)/0.16),transparent_28rem),linear-gradient(180deg,rgb(var(--app-surface)/0.82)_0%,rgb(var(--app-bg))_38%,rgb(var(--app-bg))_100%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden border-x border-[rgb(var(--app-border)/0.42)] bg-[rgb(var(--app-bg)/0.92)] shadow-[0_40px_120px_rgba(17,24,39,0.10)] dark:shadow-[0_40px_140px_rgba(0,0,0,0.46)]">
        {children}
      </div>
    </div>
  );
}
