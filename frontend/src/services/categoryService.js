// src/services/categoryService.js
import { API_CONFIG } from "./api/config";
import { getToken } from "./auth/tokenHelper"; // ← AÑADE ESTA LÍNEA

// Categorías por defecto (ajústalas si quieres que coincidan con tu backend)
const DEFAULT_CATEGORIES = [
  { id: 1, name: "Tecnología" },
  { id: 2, name: "Hogar" },
  { id: 3, name: "Moda" },
];

const categoryService = {
  baseUrl: API_CONFIG.BASE_URL,

  // Headers que incluyen token si existe
  authHeaders: () => ({
    ...API_CONFIG.HEADERS,
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  }),

  async _request(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, { headers: this.authHeaders() });
    if (!response.ok) throw new Error("Error en la petición a categorías");
    return response.json();
  },

  async getMainCategories() {
    try {
      const categories = await this._request(API_CONFIG.ENDPOINTS.CATEGORIES.MAIN);
      if (categories && categories.length > 0) {
        return categories;
      } else {
        console.warn("No se recibieron categorías del backend, usando por defecto");
        return DEFAULT_CATEGORIES;
      }
    } catch (error) {
      console.error("Error obteniendo categorías principales, usando por defecto", error);
      return DEFAULT_CATEGORIES;
    }
  },

  async getSubCategories(parentId) {
    try {
      return await this._request(API_CONFIG.ENDPOINTS.CATEGORIES.SUB(parentId));
    } catch (error) {
      console.error(`Error obteniendo subcategorías para parentId ${parentId}`, error);
      return [];
    }
  },
};

export { categoryService };