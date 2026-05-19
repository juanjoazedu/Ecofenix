// src/pages/CartPage.jsx
import { useState } from "react";
import { useCart } from "../context/CartContext";
import styles from "../styles/CartPage.module.css";

export default function CartPage() {
  const {
    cart,
    loading,
    error,
    updateItemQuantity,
    removeItem,
    emptyCart,
  } = useCart();

  const [actionLoading, setActionLoading] = useState(null); // id del ítem en proceso

  // const handleQuantityChange = async (itemId, newQuantity) => {
  //   if (newQuantity < 1) return;
  //   setActionLoading(itemId);
  //   await updateItemQuantity(itemId, newQuantity);
  //   setActionLoading(null);
  // };

  const handleQuantityChange = async (itemId, newQuantity, oldQuantity) => {
    if (newQuantity < 1) return;
    setActionLoading(itemId);
    const success = await updateItemQuantity(itemId, newQuantity);
    setActionLoading(null);
    if (!success) {
      // Restaurar la cantidad anterior si falla
      // (el contexto ya no actualizó el carrito, pero el estado local sigue con oldQuantity)
      // No es necesario forzar nada porque el carrito no se recargó.
      // Mostrar mensaje solo si quieres
      alert("No se pudo actualizar la cantidad. Verifica el stock disponible.");
    }
  };

  const handleRemove = async (itemId) => {
    setActionLoading(itemId);
    await removeItem(itemId);
    setActionLoading(null);
  };

  const handleEmptyCart = async () => {
    if (window.confirm("¿Vaciar todo el carrito?")) {
      await emptyCart();
    }
  };

  // Estados de carga/error/vacío
  if (loading) return <div className={styles.status}>Cargando carrito...</div>;
  if (error) return <div className={`${styles.status} ${styles.error}`}>Error: {error}</div>;
  if (!cart || cart.cartItems.length === 0) {
    return <div className={styles.empty}>Tu carrito está vacío.</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Tu carrito</h1>
      <div className={styles.items}>
        {cart.cartItems.map((item) => (
          <div key={item.itemId} className={styles.item}>
            <div className={styles.itemInfo}>
              <h3>{item.title}</h3>
              <p className={styles.unitPrice}>
                Precio unitario: ${item.unitPrice.toFixed(2)}
              </p>
              <p className={styles.shippingCost}>
                Envío: ${item.shippingCost.toFixed(2)}
              </p>
            </div>
            <div className={styles.controls}>
              <button
                onClick={() => handleQuantityChange(item.itemId, item.quantity - 1)}
                disabled={item.quantity <= 1 || actionLoading === item.itemId}
                className={styles.qtyBtn}
              >
                −
              </button>
              <span className={styles.qty}>{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)}
                disabled={actionLoading === item.itemId}
                className={styles.qtyBtn}
              >
                +
              </button>
            </div>
            <p className={styles.itemTotal}>${item.totalPrice.toFixed(2)}</p>
            <button
              onClick={() => handleRemove(item.itemId)}
              disabled={actionLoading === item.itemId}
              className={styles.removeBtn}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      <div className={styles.summary}>
        <p>Subtotal productos: <span>${cart.subtotalItems.toFixed(2)}</span></p>
        <p>Subtotal envíos: <span>${cart.subtotalShipping.toFixed(2)}</span></p>
        <p className={styles.total}>
          Total: <span>${cart.total.toFixed(2)}</span>
        </p>

        <button 
        className={styles.checkoutBtn}
        onClick={handleEmptyCart} className={styles.emptyBtn}>
          Vaciar carrito
        </button>

        <button
          className={styles.checkoutBtn}
          onClick={() => alert("Funcionalidad de pago en desarrollo")}
          className={styles.emptyBtn}
        >
          Efectuar compra
        </button>
      </div>
    </div>
  );
}