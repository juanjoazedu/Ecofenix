// src/context/CartContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { cartService } from "../services/cartService";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart();
      setCart(data);  // data puede ser null (carrito inexistente) o el objeto
    } catch (err) {
      setError(err.message);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = async (itemId, quantity) => {
    setError(null);
    try {
      await cartService.addItem(itemId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateItemQuantity = async (itemId, quantity) => {
    try {
      await cartService.updateItemQuantity(itemId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      // No seteamos error global, solo devolvemos false
      return false;
    }
};

  const removeItem = async (itemId) => {
    setError(null);
    try {
      await cartService.removeItem(itemId);
      await fetchCart();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const emptyCart = async () => {
    setError(null);
    try {
      await cartService.emptyCart();
      setCart(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    updateItemQuantity,
    removeItem,
    emptyCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
