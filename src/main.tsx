import * as Sentry from "@sentry/react";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.tsx';
import { store } from './store/store'; // Import the store from /store/store.tsx
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store/store'; // Import the persistor from /store/store.tsx
import './index.css';

Sentry.init({
  dsn: "https://df58476bdd769a2386ae358c367606e7@o4510506398777344.ingest.us.sentry.io/4510506401333248",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions for performance monitoring
  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions for replay
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);