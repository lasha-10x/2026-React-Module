import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App.jsx';
import CartProvider from './components/cart/CartProvider.jsx';
import AuthProvider from './components/auth/AuthProvider.jsx';
import ToastProvider from './components/ui/ToastProvider.jsx';
import ThemeProvider from './components/theme/ThemeProvider.jsx';
createRoot(document.getElementById('root')).render(<StrictMode>
    <BrowserRouter>
    <ThemeProvider>
    <ToastProvider>
    <AuthProvider>
       <CartProvider>
      <App /> 
    </CartProvider>
    </AuthProvider>
    </ToastProvider>
    </ThemeProvider>
    </BrowserRouter>
  </StrictMode>);
