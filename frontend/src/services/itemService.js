// src/services/itemService.js
import { API_CONFIG } from "./api/config";
import { getToken } from "./auth/tokenHelper";

const itemService = {
  baseUrl: API_CONFIG.BASE_URL,

  // Headers con token (para endpoints protegidos)
  authHeaders: () => ({
    ...API_CONFIG.HEADERS,
    Authorization: `Bearer ${getToken()}`,
  }),

  async getAllItems() {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.GET_ALL}`;
    const response = await fetch(url, { headers: this.authHeaders() });
    if (!response.ok) throw new Error("Error obteniendo items");
    return response.json();
  },

  async getItemById(id) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.GET_BY_ID(id)}`;
    const response = await fetch(url, { headers: this.authHeaders() });
    if (!response.ok) throw new Error("Error obteniendo item");
    return response.json();
  },

  async searchItems(query) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.SEARCH(query)}`;
    const response = await fetch(url, { headers: this.authHeaders() });
    if (!response.ok) throw new Error("Error buscando items");
    return response.json();
  },

  async getItemsByCategories(categoryIds) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ITEMS.BY_CATEGORIES(categoryIds);
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, { headers: this.authHeaders() });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error obteniendo items por categorías:", error);
      throw error;
    }
  },

  async createItem(itemData) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.CREATE}`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify(itemData),
    });
    if (!response.ok) throw new Error("Error creando item");
    return response.json();
  },

  async updateItem(id, itemData) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.UPDATE(id)}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: this.authHeaders(),
      body: JSON.stringify(itemData),
    });
    if (!response.ok) throw new Error("Error actualizando item");
    return response.json();
  },

  async deleteItem(id) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.DELETE(id)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.authHeaders(),
    });
    if (!response.ok) throw new Error("Error eliminando item");
  },

  async getItemsBySeller(sellerId) {
    const url = `${this.baseUrl}/items/seller/${sellerId}`;
    const response = await fetch(url, { headers: this.authHeaders() });
    if (!response.ok) throw new Error("Error obteniendo items del vendedor");
    return response.json();
  },
};

export { itemService };