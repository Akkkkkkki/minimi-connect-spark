import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { validateEnv } from './lib/env';

// Validate environment variables on startup
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error);
  // You might want to show a more user-friendly error message here
  document.body.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      color: #dc2626;
    ">
      <div style="text-align: center;">
        <h1>Configuration Error</h1>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Please check your environment variables and try again.</p>
      </div>
    </div>
  `;
  throw error;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
