// src/services/orderService.js
import { API_CONFIG } from "./api/config";
import { getToken } from "./auth/tokenHelper";

// Helper para leer errores que pueden venir como texto plano o JSON
async function readError(response) {
  const raw = await response.text().catch(() => "");
  if (!raw) return `Error ${response.status}`;
  try {
    const parsed = JSON.parse(raw);
    return parsed.message || parsed.error || raw;
  } catch {
    return raw;
  }
}

const orderService = {
  baseUrl: API_CONFIG.BASE_URL,

  authHeaders: () => ({
    ...API_CONFIG.HEADERS,
    Authorization: `Bearer ${getToken()}`,
  }),

  async createOrder(customerId, address, addInfo) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORDERS.CREATE}`;
    const body = {
      customerId: Number(customerId),
      address,
      addInfo,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const msg = await readError(response);
      console.error("Error del backend:", msg);
      throw new Error(msg || "Error al crear la orden");
    }
    return response.json();
  },

  // 🆕 Confirmar una orden con total = 0 (donación pura), sin pasar por ms-payments
  async confirmFreeOrder(orderId) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORDERS.CONFIRM_FREE(orderId)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeaders(),
    });

    if (!response.ok) {
      const msg = await readError(response);
      console.error("Error al confirmar orden gratuita:", msg);
      throw new Error(msg || "Error al confirmar la orden");
    }
    return response.json();
  },

  async getOrderById(orderId) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORDERS.GET_BY_ID(orderId)}`;
    const response = await fetch(url, {
      headers: this.authHeaders(),
    });

    if (!response.ok) {
      const msg = await readError(response);
      throw new Error(msg || "Orden no encontrada");
    }
    return response.json();
  },
};

export default orderService;