// src/services/user/userService.js
import { API_CONFIG } from "../api/config";
import { getToken } from "../auth/tokenHelper";

const userService = {
  baseUrl: API_CONFIG.BASE_URL,
  authHeaders: () => ({
    ...API_CONFIG.HEADERS,
    Authorization: `Bearer ${getToken()}`,
  }),

  // PÚBLICO
  async register(userData) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.REGISTER}`;
    const response = await fetch(url, {
      method: "POST",
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al registrar el usuario");
    }
    return response.json();
  },

  // PROTEGIDOS (requieren token)
  async getAllUsers() {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.GET_ALL}`;
    const response = await fetch(url, { headers: this.authHeaders() });
    if (!response.ok) throw new Error("Error al obtener los usuarios");
    return response.json();
  },

  async getUserById(id) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id)}`;
    const response = await fetch(url, { headers: this.authHeaders() });
    if (!response.ok) throw new Error("Error al obtener el usuario");
    return response.json();
  },

  async updateUser(id, userData) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.UPDATE(id)}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: this.authHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Error al actualizar el usuario");
    return response.json();
  },

  async deleteUser(id) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.DELETE(id)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.authHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar el usuario");
    // La API devuelve 204 sin cuerpo, así que no intentamos parsear JSON.
    return true; // o null
  },

  async assignRoleToUser(userId, roleTitle) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.ASSIGN_ROLE(userId, roleTitle)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeaders(),
    });
    if (!response.ok) throw new Error("Error al asignar el rol");
    return response.json();
  },

  async replaceAddresses(userId, addressesArray) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.REPLACE_ADDRESSES(userId)}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: this.authHeaders(),
      body: JSON.stringify(addressesArray), // array de { address: "texto" }
    });
    if (!response.ok) throw new Error("Error al reemplazar direcciones");
    return response.json();
  },
};

export default userService;