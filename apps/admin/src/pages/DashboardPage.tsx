import { AdminLayout } from '../components/layout/AdminLayout';
import { EmptyState } from '../components/states/EmptyState';

export function DashboardPage() {
  return (
    <AdminLayout>
      <div className="grid gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500">Dashboard</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Overview</h2>
        </div>

        <EmptyState
          title="Coming soon"
          description="Admin dashboard modules will be connected in later tasks."
        />
      </div>
    </AdminLayout>
  );
}
