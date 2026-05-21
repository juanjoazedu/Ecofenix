import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./components/Layout/Layout";

import HomePage from "./pages/HomePage";
import ItemDetailPage from "./pages/ItemDetailPage";
import PublishItemPage from "./pages/PublishItemPage";
import AboutPage from "./pages/AboutPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import EditItemPage from "./pages/EditItemPage";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              
              {/* Públicas */}
              <Route index element={<HomePage />} />
              <Route path="/catalogo" element={<HomePage />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/nosotros" element={<AboutPage />} />
              <Route path="/ingresar" element={<LoginPage />} />

              {/* Protegidas */}
              <Route
                path="/publicar"
                element={
                  <ProtectedRoute>
                    <PublishItemPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/carrito"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/articulos/editar/:id"
                element={
                  <ProtectedRoute>
                    <EditItemPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pago"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;