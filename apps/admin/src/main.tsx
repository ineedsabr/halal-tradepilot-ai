import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminRouter } from './router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminRouter />
  </React.StrictMode>,
);
