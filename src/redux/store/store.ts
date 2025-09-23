// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import persistConfig from './persistConfig';

import authReducer from '../slices/authSlice';
import userDetailsReducer from '../slices/userDetailsSlice'; // adjust path

const persistedUserDetailsReducer = persistReducer(
  persistConfig,
  userDetailsReducer
);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userDetails: persistedUserDetailsReducer,
  },
});

export const persistor = persistStore(store);

// 👇 Type helpers for your app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
