// src/services/role/roleService.js
import { API_CONFIG } from "../api/config";
import { getToken } from "../auth/tokenHelper";

const roleService = {
  baseUrl: API_CONFIG.BASE_URL,
  defaultHeaders: () => ({
    ...API_CONFIG.HEADERS,
    Authorization: `Bearer ${getToken()}`,
  }),

  async getAllRoles() {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ROLES.GET_ALL}`;
    const response = await fetch(url, {
      headers: this.defaultHeaders(),
    });

    if (!response.ok) throw new Error("Error al obtener los roles");
    return response.json();
  },

  async getRoleById(id) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ROLES.GET_BY_ID(id)}`;
    const response = await fetch(url, {
      headers: this.defaultHeaders(),
    });

    if (!response.ok) throw new Error("Error al obtener el rol");
    return response.json();
  },
};

export default roleService;