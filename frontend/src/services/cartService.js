import { API_CONFIG } from "./api/config";

// Asegurar número (el .env da string)
const TEMP_CUSTOMER_ID = Number(import.meta.env.VITE_DEFAULT_CUSTOMER_ID) || 1;

const cartService = {
  baseUrl: API_CONFIG.BASE_URL,
  defaultHeaders: API_CONFIG.HEADERS,

  async getCart(customerId = TEMP_CUSTOMER_ID) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CART.GET(customerId)}`;
    const response = await fetch(url, { headers: this.defaultHeaders });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Error al obtener el carrito");
    return response.json();
  },

  async addItem(itemId, quantity, customerId = TEMP_CUSTOMER_ID) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CART.ADD_ITEM}`;
    const body = {
      itemId: Number(itemId),        
      quantity: Number(quantity),    
      customerId: Number(customerId) 
    };
    console.log("Enviando al carrito:", body); // verifica en consola
    const response = await fetch(url, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al agregar producto al carrito");
    }
    return response;
  },

  async updateItemQuantity(itemId, quantity, customerId = TEMP_CUSTOMER_ID) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CART.UPDATE_ITEM}`;
    const body = {
      itemId: Number(itemId),
      quantity: Number(quantity),
      customerId: Number(customerId),
    };
    const response = await fetch(url, {
      method: "PUT",
      headers: this.defaultHeaders,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al actualizar cantidad");
    }
    return response;
  },

  async removeItem(itemId, customerId = TEMP_CUSTOMER_ID) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CART.REMOVE_ITEM(customerId, itemId)}`;
    const response = await fetch(url, { method: "DELETE", headers: this.defaultHeaders });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al eliminar producto del carrito");
    }
    return response;
  },

  async emptyCart(customerId = TEMP_CUSTOMER_ID) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CART.EMPTY(customerId)}`;
    const response = await fetch(url, { method: "DELETE", headers: this.defaultHeaders });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al vaciar el carrito");
    }
    return response;
  },
};

export { cartService };