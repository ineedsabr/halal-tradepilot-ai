import './App.css';

const APP_NAME = 'Halal TradePilot AI';

export function App() {
  return (
    <main className="admin-shell">
      <header className="topbar">
        <p className="eyebrow">Admin Panel</p>
        <h1>{APP_NAME}</h1>
      </header>
      <section className="content" aria-label="Status">
        Vite, React, and TypeScript admin skeleton is ready.
      </section>
    </main>
  );
}
