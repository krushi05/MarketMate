import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Intercept window.alert to prevent DOMException in sandboxed iframes without allow-modals
if (typeof window !== "undefined") {
  const nativeAlert = window.alert;
  window.alert = function (message?: any) {
    try {
      nativeAlert?.call(window, message);
    } catch {
      console.warn("[MarketMate Notice]", message);
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
