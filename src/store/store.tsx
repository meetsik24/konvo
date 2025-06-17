import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { thunk } from 'redux-thunk';
import authReducer from './slices/authSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Persist the entire auth slice
  transforms: [
    (state) => ({
      ...state,
      auth: {
        ...state.auth,
        user: state.auth.user ? { ...state.auth.user } : null, // Ensure user is an object or null
      },
    }),
  ],
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, authReducer);

// Configure the store with redux-thunk middleware
export const store = configureStore({
  reducer: {
    auth: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['auth.user'],
      },
    }), // Add redux-thunk middleware
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;