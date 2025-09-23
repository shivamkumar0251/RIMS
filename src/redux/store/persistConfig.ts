// src/redux/persistConfig.js
import storage from 'redux-persist/lib/storage'; 

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // only userDetails will be persisted
};

export default persistConfig;
