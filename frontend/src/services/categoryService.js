// src/services/categoryService.js
import { API_CONFIG } from "./api/config";

// Categorías por defecto en caso de que el backend no responda
const DEFAULT_CATEGORIES = [
  { id: 1, name: "Electrónica" },
  { id: 2, name: "Hogar" },
  { id: 3, name: "Ropa" },
  { id: 4, name: "Libros" },
  { id: 5, name: "Deportes" },
  { id: 6, name: "Juguetes" },
  { id: 7, name: "Otros" },
];

const categoryService = {
  baseUrl: API_CONFIG.BASE_URL,
  defaultHeaders: API_CONFIG.HEADERS,

  async _request(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, { headers: this.defaultHeaders });
    if (!response.ok) throw new Error("Error en la petición a categorías");
    return response.json();
  },

  // Obtener categorías principales (con fallback a DEFAULT_CATEGORIES)
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
      return []; // Devuelve array vacío en caso de error
    }
  },
};

export { categoryService };