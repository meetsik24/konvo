import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.tsx';
import { store } from './store/store'; // Import the store from /store/store.tsx
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store/store'; // Import the persistor from /store/store.tsx
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);