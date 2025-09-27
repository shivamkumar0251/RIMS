import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store/store.ts'
import { PersistGate } from 'redux-persist/integration/react'
import CategoryManagement from './pages/admin/CategoryManagement.tsx';
import AddProductAdvanced from './pages/admin/AddProduct.tsx';



createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <CategoryManagement/>
        <AddProductAdvanced />
      </BrowserRouter>
    </PersistGate>
  </Provider>
)
