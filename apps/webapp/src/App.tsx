import './App.css';

const APP_NAME = 'Halal TradePilot AI';

export function App() {
  return (
    <main className="app-shell">
      <section className="panel" aria-labelledby="webapp-title">
        <p className="eyebrow">Telegram Web App</p>
        <h1 id="webapp-title">{APP_NAME}</h1>
        <p className="description">Vite, React, and TypeScript skeleton is ready.</p>
      </section>
    </main>
  );
}
