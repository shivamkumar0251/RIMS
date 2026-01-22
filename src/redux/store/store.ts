// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import persistConfig from './persistConfig';

import authReducer from '../slices/authSlice';
import checkTokenReducer from '../slices/checkTokenSlice';
import userDetailsReducer from '../slices/userDetailsSlice'; // adjust path
import categoryReducer from '../slices/categorySlice';
import companyReducer from '../slices/companySlice';
import vendorReducer from '../slices/vendorSlice';
import productReducer from '../slices/productSlice';
import orderReducer from '../slices/orderSlice';
import purchaseReducer from '../slices/purchaseSlice';
import storeStockReducer from '../slices/storeStockSlice';
import kitchenStockReducer from '../slices/kitchenStockSlice';
import consumableStockReducer from '../slices/consumableStockSlice';
import setupStockReducer from '../slices/setupStockSlice';
import productRequirementReducer from '../slices/productRequirementSlice';
import franchiseReducer from '../slices/franchiseSlice';
import outletReducer from '../slices/outletSlice';
import vendorOrderReducer from '../slices/vendorOrderSlice';
import franchiseInquiryReducer from '../slices/franchiseInquirySlice';
import dashboardReducer from '../slices/dashboardSlice';
import reportReducer from '../slices/reportSlice';

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
    company: companyReducer,
    vendor: vendorReducer,
    product: productReducer,
    order: orderReducer,
    purchase: purchaseReducer,
    storeStock: storeStockReducer,
    kitchenStock: kitchenStockReducer,
    consumableStock: consumableStockReducer,
    setupStock: setupStockReducer,
    productRequirement: productRequirementReducer,
    franchise: franchiseReducer,
    outlet: outletReducer,
    vendorOrder: vendorOrderReducer,
    franchiseInquiry: franchiseInquiryReducer,
    dashboard: dashboardReducer,
    reports: reportReducer,
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
