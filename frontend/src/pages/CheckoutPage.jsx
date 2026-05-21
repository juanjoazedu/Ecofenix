// src/pages/CheckoutPage.jsx
import { useState } from "react";
import styles from "../styles/CheckoutPage.module.css";

const CheckoutPage = () => {
  const [step, setStep] = useState("review"); // review | payment | success

  // Datos mock del pedido
  const mockItems = [
    { id: 1, title: "Chaqueta de invierno", type: "FOR_SALE", price: 25000 },
    { id: 2, title: "Libros de texto usados", type: "DONATION", price: 0 },
    { id: 3, title: "Lámpara de escritorio", type: "FOR_SALE", price: 12500 },
  ];

  const subtotal = mockItems
    .filter((item) => item.type === "FOR_SALE")
    .reduce((sum, item) => sum + item.price, 0);
  const donationItems = mockItems.filter((item) => item.type === "DONATION").length;

  const handleContinue = () => setStep("payment");
  const handleConfirmPayment = (e) => {
    e.preventDefault();
    setStep("success");
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Proceso de pago</h1>

        {/* Indicador de pasos */}
        <div className={styles.stepsIndicator}>
          <div className={`${styles.step} ${step === "review" || step === "payment" || step === "success" ? styles.activeStep : ""}`}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>Revisión</span>
          </div>
          <div className={styles.stepDivider}></div>
          <div className={`${styles.step} ${step === "payment" || step === "success" ? styles.activeStep : ""}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>Pago</span>
          </div>
          <div className={styles.stepDivider}></div>
          <div className={`${styles.step} ${step === "success" ? styles.activeStep : ""}`}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepLabel}>Confirmación</span>
          </div>
        </div>

        {/* Paso 1: Revisión del pedido */}
        {step === "review" && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Resumen del pedido</h2>

            <div className={styles.cartItems}>
              {mockItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemBadge}>
                      {item.type === "DONATION" ? "Donación" : "Venta solidaria"}
                    </span>
                  </div>
                  <span className={styles.itemPrice}>
                    {item.type === "DONATION" ? "Gratuito" : `$${item.price.toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span>Artículos con costo</span>
                <span>{mockItems.filter(i => i.type === "FOR_SALE").length}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Donaciones incluidas</span>
                <span>{donationItems}</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total a pagar</span>
                <span className={styles.totalAmount}>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button className={styles.primaryBtn} onClick={handleContinue}>
              Continuar al pago
            </button>
          </div>
        )}

        {/* Paso 2: Formulario de pago */}
        {step === "payment" && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Datos de pago</h2>

            <form onSubmit={handleConfirmPayment} className={styles.form}>
              <div className={styles.field}>
                <label>Nombre en la tarjeta</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ej. María García"
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Número de tarjeta</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Vencimiento</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="MM/AA"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>CVV</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className={styles.totalReminder}>
                Total a pagar: <strong>${subtotal.toFixed(2)}</strong>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setStep("review")}
                >
                  Volver
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  Confirmar pago
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Paso 3: Éxito */}
        {step === "success" && (
          <div className={styles.card}>
            <div className={styles.successContent}>
              <div className={styles.successIcon}>✓</div>
              <h2 className={styles.successTitle}>¡Pago exitoso!</h2>
              <p className={styles.successText}>
                Tu contribución solidaria ha sido procesada.<br />
                Recibirás un correo con los detalles.
              </p>
              <a href="/catalogo" className={styles.primaryBtn}>
                Seguir explorando
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;