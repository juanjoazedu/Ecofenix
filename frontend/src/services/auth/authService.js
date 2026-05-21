// src/services/auth/authService.js
import { API_CONFIG } from "../api/config";
import { setToken } from "./tokenHelper";

const authService = {
  baseUrl: API_CONFIG.BASE_URL,
  defaultHeaders: API_CONFIG.HEADERS,

  async login(usernameOrEmail, password) {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error en el inicio de sesión");
    }

    const data = await response.json();
    // Guardamos el token en localStorage
    setToken(data.token);
    return data; // { token, type, id, username, email, roles }
  },

  logout() {
    setToken(null); // elimina el token
  }
};

export default authService;