import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import trainReducer from './slices/trainSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    train: trainReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
