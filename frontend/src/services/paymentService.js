// src/services/paymentService.js
import { API_CONFIG } from "./api/config";
import { getToken } from "./auth/tokenHelper";

// Lee el body de la respuesta, sea texto plano o JSON.
// Devuelve un string apto para mostrar como mensaje de error.
async function readError(response) {
  const raw = await response.text().catch(() => "");
  if (!raw) return `Error ${response.status}`;
  // Intentar JSON; si no, devolver el texto crudo.
  try {
    const parsed = JSON.parse(raw);
    return parsed.message || parsed.error || raw;
  } catch {
    return raw;
  }
}

const paymentService = {
  baseUrl: API_CONFIG.BASE_URL,

  authHeaders: () => ({
    ...API_CONFIG.HEADERS,
    Authorization: `Bearer ${getToken()}`,
  }),

  async createPayment(total, paymentMethod, installments, orderId) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.PAYMENTS.CREATE}`;
    const body = {
      total: Number(total),
      paymentMethod,
      installments: Number(installments),
      orderId: Number(orderId),
    };

    console.log("Enviando pago:", body); // útil mientras debuggeamos

    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const msg = await readError(response);
      console.error("Error backend al crear pago:", msg);
      throw new Error(msg);
    }
    return response.json();
  },

  async getPaymentById(id) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.PAYMENTS.GET_BY_ID(id)}`;
    const response = await fetch(url, {
      headers: this.authHeaders(),
    });

    if (!response.ok) {
      const msg = await readError(response);
      throw new Error(msg || "Pago no encontrado");
    }
    return response.json();
  },

  async getInvoiceByPaymentId(paymentId) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.PAYMENTS.GET_INVOICE(paymentId)}`;
    const response = await fetch(url, {
      headers: this.authHeaders(),
    });

    if (!response.ok) {
      const msg = await readError(response);
      throw new Error(msg || "Factura no encontrada");
    }
    return response.json();
  },
};

export default paymentService;