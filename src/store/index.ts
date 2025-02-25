import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import thunk from 'redux-thunk';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;