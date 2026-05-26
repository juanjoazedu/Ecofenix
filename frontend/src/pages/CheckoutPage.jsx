// src/pages/CheckoutPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import orderService from "../services/orderService";
import paymentService from "../services/paymentService";
import userService from "../services/user/userService";
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

  // Datos ilustrativos de la tarjeta
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardFlipped, setCardFlipped] = useState(false);

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(raw.replace(/(.{4})/g, "$1 ").trim());
  };

  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardExpiry(raw.length > 2 ? raw.slice(0, 2) + "/" + raw.slice(2) : raw);
  };

  const cardBrand = () => {
    const first = cardNumber.replace(/\s/g, "")[0];
    if (first === "4") return "VISA";
    if (first === "5") return "MASTERCARD";
    if (first === "3") return "AMEX";
    return "";
  };

  // Estados de carga y error
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cardErrors, setCardErrors] = useState({});

  // Direcciones del perfil del usuario
  const [userAddresses, setUserAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [address, setAddress] = useState("");
  const [addInfo, setAddInfo] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    userService.getUserById(user.id)
      .then((data) => {
        const addrs = data.addresses?.map((a) => a.address).filter(Boolean) || [];
        setUserAddresses(addrs);
        if (addrs.length > 0) setAddress(addrs[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  }, [user?.id]);

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
    if (!address) {
      setErrorMessage("Debes seleccionar una dirección de envío.");
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
    const errors = {};
    if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16)
      errors.cardNumber = "Ingresa un número de tarjeta válido (16 dígitos).";
    if (!cardName.trim())
      errors.cardName = "Ingresa el nombre del titular.";
    if (!cardExpiry || cardExpiry.length < 5)
      errors.cardExpiry = "Ingresa la fecha de vencimiento (MM/AA).";
    if (!cardCvv || cardCvv.length < 3)
      errors.cardCvv = "Ingresa el CVV (3 dígitos).";
    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }
    setCardErrors({});

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
              {loadingAddresses ? (
                <p>Cargando direcciones...</p>
              ) : userAddresses.length === 0 ? (
                <p className={styles.errorMessage}>
                  No tienes direcciones guardadas.{" "}
                  <a href="/perfil">Agrégalas en tu perfil</a> antes de continuar.
                </p>
              ) : (
                <>
                  <div className={styles.field}>
                    <label>Selecciona una dirección</label>
                    <select
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={styles.input}
                    >
                      {userAddresses.map((addr, i) => (
                        <option key={i} value={addr}>{addr}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Información adicional (opcional)</label>
                    <input
                      type="text"
                      value={addInfo}
                      onChange={(e) => setAddInfo(e.target.value)}
                      placeholder="Apto, piso, referencias..."
                      className={styles.input}
                    />
                  </div>
                </>
              )}
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

            {/* Tarjeta visual */}
            <div className={styles.cardScene}>
              <div className={`${styles.cardVisual} ${cardFlipped ? styles.cardVisualFlipped : ""} ${paymentMethod === "CREDIT" ? styles.cardCredit : styles.cardDebit}`}>
                {/* Frente */}
                <div className={styles.cardFront}>
                  <div className={styles.cardVisualTop}>
                    <span className={styles.cardChip} />
                    <span className={styles.cardBrand}>{cardBrand()}</span>
                  </div>
                  <div className={styles.cardNum}>
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>
                  <div className={styles.cardVisualBottom}>
                    <div>
                      <div className={styles.cardLabel}>Titular</div>
                      <div className={styles.cardValue}>{cardName || "NOMBRE APELLIDO"}</div>
                    </div>
                    <div>
                      <div className={styles.cardLabel}>Vence</div>
                      <div className={styles.cardValue}>{cardExpiry || "MM/AA"}</div>
                    </div>
                  </div>
                </div>
                {/* Reverso */}
                <div className={styles.cardBack}>
                  <div className={styles.cardStripe} />
                  <div className={styles.cardCvvRow}>
                    <span className={styles.cardLabel}>CVV</span>
                    <span className={styles.cardCvvBox}>{cardCvv || "•••"}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className={styles.form}>
              {/* Selector débito / crédito */}
              <div className={styles.field}>
                <label>Tipo de tarjeta</label>
                <div className={styles.cardTypeSelector}>
                  <button
                    type="button"
                    className={`${styles.cardTypeBtn} ${paymentMethod === "DEBIT" ? styles.cardTypeBtnActive : ""}`}
                    onClick={() => setPaymentMethod("DEBIT")}
                  >
                    Débito
                  </button>
                  <button
                    type="button"
                    className={`${styles.cardTypeBtn} ${paymentMethod === "CREDIT" ? styles.cardTypeBtnActive : ""}`}
                    onClick={() => setPaymentMethod("CREDIT")}
                  >
                    Crédito
                  </button>
                </div>
              </div>

              {/* Número de tarjeta */}
              <div className={styles.field}>
                <label>Número de tarjeta</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => { handleCardNumberChange(e); setCardErrors(p => ({ ...p, cardNumber: "" })); }}
                  maxLength={19}
                  className={`${styles.input} ${cardErrors.cardNumber ? styles.inputError : ""}`}
                  onFocus={() => setCardFlipped(false)}
                />
                {cardErrors.cardNumber && <span className={styles.fieldError}>{cardErrors.cardNumber}</span>}
              </div>

              {/* Nombre titular */}
              <div className={styles.field}>
                <label>Nombre del titular</label>
                <input
                  type="text"
                  placeholder="Como aparece en la tarjeta"
                  value={cardName}
                  onChange={(e) => { setCardName(e.target.value.toUpperCase()); setCardErrors(p => ({ ...p, cardName: "" })); }}
                  className={`${styles.input} ${cardErrors.cardName ? styles.inputError : ""}`}
                  onFocus={() => setCardFlipped(false)}
                />
                {cardErrors.cardName && <span className={styles.fieldError}>{cardErrors.cardName}</span>}
              </div>

              {/* Vencimiento y CVV */}
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Fecha de vencimiento</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => { handleExpiryChange(e); setCardErrors(p => ({ ...p, cardExpiry: "" })); }}
                    maxLength={5}
                    className={`${styles.input} ${cardErrors.cardExpiry ? styles.inputError : ""}`}
                    onFocus={() => setCardFlipped(false)}
                  />
                  {cardErrors.cardExpiry && <span className={styles.fieldError}>{cardErrors.cardExpiry}</span>}
                </div>
                <div className={styles.field}>
                  <label>CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="•••"
                    value={cardCvv}
                    onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3)); setCardErrors(p => ({ ...p, cardCvv: "" })); }}
                    maxLength={3}
                    className={`${styles.input} ${cardErrors.cardCvv ? styles.inputError : ""}`}
                    onFocus={() => setCardFlipped(true)}
                    onBlur={() => setCardFlipped(false)}
                  />
                  {cardErrors.cardCvv && <span className={styles.fieldError}>{cardErrors.cardCvv}</span>}
                </div>
              </div>

              {/* Cuotas (solo crédito) */}
              {paymentMethod === "CREDIT" && (
                <div className={styles.field}>
                  <label>Número de cuotas</label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className={styles.input}
                  >
                    {[1, 3, 6, 12, 18, 24].map((n) => (
                      <option key={n} value={n}>
                        {n === 1 ? "1 cuota (sin interés)" : `${n} cuotas`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.totalReminder}>
                Total a pagar:{" "}
                <strong>
                  ${orderTotal != null ? orderTotal.toFixed(2) : total.toFixed(2)}
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