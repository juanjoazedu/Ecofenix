import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import ItemDetailPage from "./pages/ItemDetailPage";
import PublishItemPage from "./pages/PublishItemPage";
import AboutPage from "./pages/AboutPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/catalogo" element={<HomePage />} />
              <Route path="/item/:id" element={<ItemDetailPage />} />
              <Route path="/publicar" element={<PublishItemPage />} />
              <Route path="/nosotros" element={<AboutPage />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/ingresar" element={<LoginPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/pago" element={<CheckoutPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;