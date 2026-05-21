// src/context/CartContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { cartService } from "../services/cartService";
import { useAuth } from "./AuthContext";  

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();             
  const customerId = user?.id || null;    

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!customerId) {                    
      setCart(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart(customerId);   
      setCart(data);
    } catch (err) {
      setError(err.message);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const addItem = async (itemId, quantity) => {
    if (!customerId) return false;
    setError(null);
    try {
      await cartService.addItem(customerId, itemId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateItemQuantity = async (itemId, quantity) => {
    if (!customerId) return false;
    try {
      await cartService.updateItemQuantity(customerId, itemId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      return false;
    }
  };

  const removeItem = async (itemId) => {
    if (!customerId) return false;
    setError(null);
    try {
      await cartService.removeItem(customerId, itemId);
      await fetchCart();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const emptyCart = async () => {
    if (!customerId) return false;
    setError(null);
    try {
      await cartService.emptyCart(customerId);
      setCart(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Recargar el carrito cada vez que cambie el usuario (login/logout)
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