import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/WishlistContext";
import "./index.css";
const container = document.getElementById("root");
if (container === null)
    throw new Error("Root element #root was not found in index.html");
createRoot(container).render(<StrictMode>
    {/* Last line of defence: if anything outside the page crashes, the user still sees a fallback. */}
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <OrdersProvider>
                  <WishlistProvider>
                    <CompareProvider>
                      <App />
                    </CompareProvider>
                  </WishlistProvider>
                </OrdersProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>);
