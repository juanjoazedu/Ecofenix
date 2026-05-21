// src/services/cartService.js
import { API_CONFIG } from "./api/config";
import { getToken } from "./auth/tokenHelper";

const cartService = {
  baseUrl: API_CONFIG.BASE_URL,

  // Headers con token (para endpoints protegidos)
  authHeaders: () => ({
    ...API_CONFIG.HEADERS,
    Authorization: `Bearer ${getToken()}`,
  }),

  async getCart(customerId) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CART.GET(customerId)}`;
    const response = await fetch(url, { headers: this.authHeaders() });
    if (response.status === 404) return { items: [] };  
    if (!response.ok) throw new Error("Error al obtener el carrito");
    return response.json();
  },

  async addItem(customerId, itemId, quantity) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CART.ADD_ITEM}`;
    const body = {
      customerId: Number(customerId),
      itemId: Number(itemId),
      quantity: Number(quantity),
    };
    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al agregar producto al carrito");
    }
    return response;
  },

  async updateItemQuantity(customerId, itemId, quantity) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CART.UPDATE_ITEM}`;
    const body = {
      customerId: Number(customerId),
      itemId: Number(itemId),
      quantity: Number(quantity),
    };
    const response = await fetch(url, {
      method: "PUT",
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al actualizar cantidad");
    }
    return response;
  },

  async removeItem(customerId, itemId) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CART.REMOVE_ITEM(customerId, itemId)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.authHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al eliminar producto del carrito");
    }
    return response;
  },

  async emptyCart(customerId) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CART.EMPTY(customerId)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.authHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al vaciar el carrito");
    }
    return response;
  },
};

export { cartService };