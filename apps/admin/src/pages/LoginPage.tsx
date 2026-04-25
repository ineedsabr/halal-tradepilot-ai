import { ADMIN_LABEL, APP_NAME } from '../app/config';

function LoginForm() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">{ADMIN_LABEL}</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">{APP_NAME}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Admin access will be connected in a later task.
        </p>

        <form className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-500"
              disabled
              placeholder="admin@example.com"
              type="email"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Password
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-500"
              disabled
              placeholder="Password"
              type="password"
            />
          </label>

          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white opacity-50"
            disabled
            type="button"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}

export function LoginPage() {
  return <LoginForm />;
}
