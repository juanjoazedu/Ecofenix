import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext"; // ← Debe importar desde aquí
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import ItemDetailPage from "./pages/ItemDetailPage";
import PublishItemPage from "./pages/PublishItemPage";
import AboutPage from "./pages/AboutPage";
import CartPage from "./pages/CartPage";

function App() {
  return (
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
            <Route path="/ingresar" element={<div className="container py-12">Ingreso (próximamente)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;