// src/pages/CheckoutPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import orderService from "../services/orderService";
import paymentService from "../services/paymentService";
import styles from "../styles/CheckoutPage.module.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, error: cartError, emptyCart, fetchCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState("review"); // review | payment | success
  const [orderId, setOrderId] = useState(null);
  const [orderTotal, setOrderTotal] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  // Formulario de pago
  const [paymentMethod, setPaymentMethod] = useState("DEBIT");
  const [installments, setInstallments] = useState(1);

  // Estados de carga y error
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Dirección (mock por ahora)
  const [address] = useState("Calle 10 #20-30");
  const [addInfo] = useState("Apartamento 502");

  // ¿El carrito es solo donaciones? (total = 0)
  const isFreeOrder = (cart?.total ?? 0) === 0;

  // Redirect automático tras éxito
  useEffect(() => {
    if (step !== "success") return;

    // Caso pago normal: ir a la factura
    if (paymentId) {
      const t = setTimeout(() => navigate(`/factura/${paymentId}`), 1800);
      return () => clearTimeout(t);
    }

    // Caso donación: no hay factura, ir al catálogo
    if (orderTotal === 0 && orderId) {
      const t = setTimeout(() => navigate("/catalogo"), 2400);
      return () => clearTimeout(t);
    }
  }, [step, paymentId, orderTotal, orderId, navigate]);

  // Paso 1: crear orden (y, si es donación pura, confirmar de una vez)
  const handleContinueToPayment = async () => {
    if (!user?.id) {
      setErrorMessage("Debes iniciar sesión para continuar.");
      return;
    }
    if (!cart || cart.cartItems.length === 0) {
      setErrorMessage("El carrito está vacío.");
      return;
    }

    setCreatingOrder(true);
    setErrorMessage("");
    try {
      const order = await orderService.createOrder(user.id, address, addInfo);
      setOrderId(order.id);
      setOrderTotal(order.total);

      // Si es donación pura → confirmar sin pasar por pago
      if (order.total === 0) {
        await orderService.confirmFreeOrder(order.id);
        setStep("success");
        // Vaciar el carrito después de mostrar el éxito
        setTimeout(async () => {
          await emptyCart();
          await fetchCart();
        }, 100);
      } else {
        setStep("payment");
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setCreatingOrder(false);
    }
  };

  // Paso 2: procesar pago (solo se usa cuando total > 0)
  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!orderId || orderTotal == null) {
      setErrorMessage("Falta información de la orden. Vuelve a intentarlo.");
      return;
    }
    if (!paymentMethod) {
      setErrorMessage("Selecciona un método de pago.");
      return;
    }
    if (paymentMethod === "CREDIT" && installments < 1) {
      setErrorMessage("Las cuotas deben ser al menos 1.");
      return;
    }

    setProcessingPayment(true);
    setErrorMessage("");
    try {
      const payment = await paymentService.createPayment(
        orderTotal,
        paymentMethod,
        paymentMethod === "CREDIT" ? installments : 1,
        orderId
      );
      // Pago exitoso
      setPaymentId(payment.id);
      setStep("success");
      // Vaciar el carrito después de mostrar el éxito
      setTimeout(async () => {
        await emptyCart();
        await fetchCart();
      }, 100);
    } catch (err) {
      if (err.message.includes("no está en estado pendiente de pago")) {
        setErrorMessage("Esta orden ya ha sido pagada. Redirigiendo...");
        setTimeout(() => navigate("/catalogo"), 2000);
      } else {
        setErrorMessage(err.message);
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  // Si ya estamos en el paso de éxito, mostrar siempre la pantalla de éxito
  if (step === "success") {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.successContent}>
              <div className={styles.successIcon}>✓</div>
              <h2 className={styles.successTitle}>
                {orderTotal === 0
                  ? "¡Donación registrada!"
                  : "¡Pago exitoso!"}
              </h2>
              <p className={styles.successText}>
                {orderTotal === 0 ? (
                  <>
                    Gracias por contribuir.
                    <br />
                    El donante se pondrá en contacto contigo para coordinar la
                    entrega.
                  </>
                ) : (
                  <>
                    Tu contribución solidaria ha sido procesada.
                    <br />
                    Te estamos redirigiendo a tu factura...
                  </>
                )}
              </p>

              <div className={styles.redirectIndicator}>
                <span className={styles.spinner}></span>
                <span>Redirigiendo</span>
              </div>

              {paymentId && (
                <button
                  className={styles.linkBtn}
                  onClick={() => navigate(`/factura/${paymentId}`)}
                >
                  Ver factura ahora →
                </button>
              )}
              {!paymentId && orderTotal === 0 && (
                <button
                  className={styles.linkBtn}
                  onClick={() => navigate("/catalogo")}
                >
                  Seguir explorando →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estados de carga del carrito (solo para pasos review y payment)
  if (cartLoading)
    return <div className={styles.status}>Cargando carrito...</div>;
  if (cartError)
    return (
      <div className={`${styles.status} ${styles.error}`}>
        Error: {cartError}
      </div>
    );
  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className={styles.empty}>
        Tu carrito está vacío. Agrega productos antes de continuar.
      </div>
    );
  }

  const subtotalItems = cart.subtotalItems || 0;
  const subtotalShipping = cart.subtotalShipping || 0;
  const total = cart.total || 0;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>
          {isFreeOrder ? "Confirmar donación" : "Proceso de pago"}
        </h1>

        {/* Indicador de pasos (oculto en donación pura) */}
        {!isFreeOrder && (
          <div className={styles.stepsIndicator}>
            <div
              className={`${styles.step} ${
                step === "review" || step === "payment" || step === "success"
                  ? styles.activeStep
                  : ""
              }`}
            >
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepLabel}>Revisión</span>
            </div>
            <div className={styles.stepDivider}></div>
            <div
              className={`${styles.step} ${
                step === "payment" || step === "success"
                  ? styles.activeStep
                  : ""
              }`}
            >
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepLabel}>Pago</span>
            </div>
            <div className={styles.stepDivider}></div>
            <div
              className={`${styles.step} ${
                step === "success" ? styles.activeStep : ""
              }`}
            >
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepLabel}>Confirmación</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        {/* Paso 1: Revisión */}
        {step === "review" && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Resumen del pedido</h2>

            <div className={styles.cartItems}>
              {cart.cartItems.map((item) => (
                <div key={item.itemId} className={styles.cartItem}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemBadge}>
                      {item.unitPrice === 0 ? "Donación" : "Venta solidaria"}
                    </span>
                  </div>
                  <span className={styles.itemPrice}>
                    {item.unitPrice === 0
                      ? "Gratuito"
                      : `$${item.unitPrice.toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span>Subtotal productos</span>
                <span>${subtotalItems.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Envío</span>
                <span>${subtotalShipping.toFixed(2)}</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total a pagar</span>
                <span className={styles.totalAmount}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {isFreeOrder && (
              <p className={styles.freeOrderNote}>
                Esta orden corresponde a una donación. No se cobrará ningún
                monto. Al confirmar, el donante coordinará la entrega contigo.
              </p>
            )}

            <div className={styles.addressSection}>
              <h3>Dirección de envío</h3>
              <p>
                {address}
                {addInfo ? `, ${addInfo}` : ""}
              </p>
            </div>

            <button
              className={styles.primaryBtn}
              onClick={handleContinueToPayment}
              disabled={creatingOrder}
            >
              {creatingOrder
                ? isFreeOrder
                  ? "Confirmando..."
                  : "Creando orden..."
                : isFreeOrder
                ? "Confirmar donación"
                : "Continuar al pago"}
            </button>
          </div>
        )}

        {/* Paso 2: Pago (solo cuando total > 0) */}
        {step === "payment" && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Datos de pago</h2>

            <form onSubmit={handleConfirmPayment} className={styles.form}>
              <div className={styles.field}>
                <label>Método de pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={styles.input}
                >
                  <option value="DEBIT">Tarjeta de débito</option>
                  <option value="CREDIT">Tarjeta de crédito</option>
                </select>
              </div>

              {paymentMethod === "CREDIT" && (
                <div className={styles.field}>
                  <label>Número de cuotas</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className={styles.input}
                  />
                </div>
              )}

              <div className={styles.totalReminder}>
                Total a pagar:{" "}
                <strong>
                  $
                  {orderTotal != null
                    ? orderTotal.toFixed(2)
                    : total.toFixed(2)}
                </strong>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setStep("review")}
                  disabled={processingPayment}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={processingPayment}
                >
                  {processingPayment ? "Procesando..." : "Confirmar pago"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;