import { PropsWithChildren } from 'react';
import { ADMIN_LABEL, APP_NAME } from '../../app/config';

export function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 md:block">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{ADMIN_LABEL}</p>
        <h1 className="mt-2 text-lg font-semibold">{APP_NAME}</h1>
      </aside>

      <div className="min-h-screen md:pl-64">
        <header className="border-b border-slate-200 bg-white px-5 py-4">
          <p className="text-sm font-medium text-slate-600">{ADMIN_LABEL}</p>
        </header>
        <main className="px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
