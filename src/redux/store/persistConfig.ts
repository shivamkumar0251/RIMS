// src/redux/persistConfig.js
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // only userDetails will be persisted
};

export default persistConfig;
