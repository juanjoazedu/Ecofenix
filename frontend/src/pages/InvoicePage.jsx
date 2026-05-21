// src/pages/InvoicePage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import paymentService from "../services/paymentService";
import styles from "../styles/InvoicePage.module.css";

export default function InvoicePage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    paymentService
      .getInvoiceByPaymentId(paymentId)
      .then((data) => {
        if (!mounted) return;
        console.log("Factura recibida:", data);
        setInvoice(data);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error(err);
        setError(err.message || "No se pudo cargar la factura");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [paymentId]);

  if (loading) {
    return <div className={styles.status}>Cargando factura...</div>;
  }

  if (error) {
    return (
      <div className={`${styles.status} ${styles.error}`}>
        Error: {error}
      </div>
    );
  }

  if (!invoice) {
    return <div className={styles.status}>Factura no encontrada</div>;
  }

  // Adaptadores defensivos: distintos backends nombran los campos distinto.
  // Si tu DTO usa otros nombres, ajústalos aquí en un solo lugar.
  const invoiceNumber = invoice.invoiceNumber ?? invoice.number ?? invoice.id;
  const issueDate = invoice.issueDate ?? invoice.createdAt ?? invoice.date;
  const customerName =
    invoice.customerName ?? invoice.customer?.name ?? "Cliente";
  const customerEmail =
    invoice.customerEmail ?? invoice.customer?.email ?? null;
  const address = invoice.address ?? invoice.shippingAddress ?? "";
  const addInfo = invoice.addInfo ?? invoice.addressInfo ?? "";
  const paymentMethod = invoice.paymentMethod ?? invoice.method ?? "—";
  const installments = invoice.installments ?? 0;
  const subtotalItems =
    invoice.subtotalItems ?? invoice.itemsSubtotal ?? 0;
  const subtotalShipping =
    invoice.subtotalShipping ?? invoice.shippingSubtotal ?? 0;
  const total = invoice.total ?? 0;
  const items = invoice.items ?? invoice.invoiceItems ?? [];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);

  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(date);
    }
  };

  const methodLabel = (m) => {
    if (m === "CREDIT") return "Tarjeta de crédito";
    if (m === "DEBIT") return "Tarjeta de débito";
    return m;
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Encabezado */}
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Factura electrónica</p>
            <h1 className={styles.invoiceNumber}>
              Nº {invoiceNumber}
            </h1>
            <p className={styles.issueDate}>{formatDate(issueDate)}</p>
          </div>
          <div className={styles.badge}>Pagada</div>
        </div>

        {/* Tarjeta principal */}
        <div className={styles.card}>
          {/* Datos del cliente y envío */}
          <div className={styles.infoGrid}>
            <div className={styles.infoBlock}>
              <h3 className={styles.infoTitle}>Cliente</h3>
              <p className={styles.infoLine}>{customerName}</p>
              {customerEmail && (
                <p className={styles.infoLineMuted}>{customerEmail}</p>
              )}
            </div>

            <div className={styles.infoBlock}>
              <h3 className={styles.infoTitle}>Dirección de envío</h3>
              <p className={styles.infoLine}>{address}</p>
              {addInfo && (
                <p className={styles.infoLineMuted}>{addInfo}</p>
              )}
            </div>

            <div className={styles.infoBlock}>
              <h3 className={styles.infoTitle}>Método de pago</h3>
              <p className={styles.infoLine}>{methodLabel(paymentMethod)}</p>
              {paymentMethod === "CREDIT" && installments > 0 && (
                <p className={styles.infoLineMuted}>
                  {installments} {installments === 1 ? "cuota" : "cuotas"}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <h2 className={styles.sectionTitle}>Detalle del pedido</h2>
          {items.length === 0 ? (
            <p className={styles.emptyItems}>
              No hay artículos en esta factura.
            </p>
          ) : (
            <div className={styles.itemsTable}>
              <div className={styles.itemsHeader}>
                <span>Artículo</span>
                <span className={styles.alignCenter}>Cant.</span>
                <span className={styles.alignRight}>Precio unit.</span>
                <span className={styles.alignRight}>Subtotal</span>
              </div>

              {items.map((item, idx) => (
                <div
                  key={item.id ?? item.itemId ?? idx}
                  className={styles.itemRow}
                >
                  <div className={styles.itemMain}>
                    <span className={styles.itemTitle}>
                      {item.title ?? item.name ?? `Artículo ${idx + 1}`}
                    </span>
                    {item.shippingCost > 0 && (
                      <span className={styles.itemShipping}>
                        Envío: {formatCurrency(item.shippingCost)}
                      </span>
                    )}
                  </div>
                  <span className={styles.alignCenter}>
                    {item.quantity ?? 1}
                  </span>
                  <span className={styles.alignRight}>
                    {formatCurrency(item.unitPrice)}
                  </span>
                  <span className={`${styles.alignRight} ${styles.itemTotal}`}>
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Totales */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span>Subtotal productos</span>
              <span>{formatCurrency(subtotalItems)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Envío</span>
              <span>{formatCurrency(subtotalShipping)}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total pagado</span>
              <span className={styles.totalAmount}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.actions}>
          <button
            className={styles.secondaryBtn}
            onClick={() => window.print()}
          >
            Imprimir factura
          </button>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/catalogo")}
          >
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  );
}