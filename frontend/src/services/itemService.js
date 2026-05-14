// src/services/itemService.js
import { API_CONFIG } from "./api/config";

const itemService = {
  baseUrl: API_CONFIG.BASE_URL,
  defaultHeaders: API_CONFIG.HEADERS,

  async getAllItems() {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.GET_ALL}`;
    const response = await fetch(url, { headers: this.defaultHeaders });
    if (!response.ok) throw new Error("Error obteniendo items");
    return response.json();
  },

  async getItemById(id) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.GET_BY_ID(id)}`;
    const response = await fetch(url, { headers: this.defaultHeaders });
    if (!response.ok) throw new Error("Error obteniendo item");
    return response.json();
  },

  async searchItems(query) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.SEARCH(query)}`;
    const response = await fetch(url, { headers: this.defaultHeaders });
    if (!response.ok) throw new Error("Error buscando items");
    return response.json();
  },

  async getItemsByCategories(categoryIds) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ITEMS.BY_CATEGORIES(categoryIds);
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, { 
        headers: this.defaultHeaders 
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo items por categorías:', error);
      throw error;
    }
  },

  async createItem(itemData) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.CREATE}`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify(itemData),
    });
    if (!response.ok) throw new Error("Error creando item");
    return response.json();
  },

  async updateItem(id, itemData) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.UPDATE(id)}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: this.defaultHeaders,
      body: JSON.stringify(itemData),
    });
    if (!response.ok) throw new Error("Error actualizando item");
    return response.json();
  },

  async deleteItem(id) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ITEMS.DELETE(id)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.defaultHeaders,
    });
    if (!response.ok) throw new Error("Error eliminando item");
  },

  async getItemsBySeller(sellerId) {
    const url = `${this.baseUrl}/items/seller/${sellerId}`;
    const response = await fetch(url, { headers: this.defaultHeaders });
    if (!response.ok) throw new Error("Error obteniendo items del vendedor");
    return response.json();
  }
};

export { itemService };