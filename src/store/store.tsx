import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Use localStorage
import authReducer from './slices/authSlice';

// Configure persistence
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist the auth reducer
};

const persistedReducer = persistReducer(persistConfig, authReducer);

// Create the store with the persisted reducer
export const store = configureStore({
  reducer: {
    auth: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'], // Ignore redux-persist actions
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;