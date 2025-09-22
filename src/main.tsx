import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  // <Provider store={store}>
  // <Provider store={store}>
  // <PersistGate loading={null} persistor={persistor}>
  // <PersistGate loading={null} >
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  // </PersistGate>,
  // </Provider>,
)
