// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import persistConfig from './persistConfig';

import authReducer from '../slices/authSlice';
import checkTokenReducer from '../slices/checkTokenSlice';
import userDetailsReducer from '../slices/userDetailsSlice'; // adjust path
import categoryReducer from '../slices/categorySlice';

const persistedUserDetailsReducer = persistReducer(
  persistConfig,
  userDetailsReducer
);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userDetails: persistedUserDetailsReducer,
    checkToken: checkTokenReducer,
    category: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// 👇 Type helpers for your app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
