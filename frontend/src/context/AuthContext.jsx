// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth/authService";
import userService from "../services/user/userService";
import { getToken, removeToken } from "../services/auth/tokenHelper";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, username, email, roles, ... }
  const [loading, setLoading] = useState(true);

  // Al montar, si hay token guardado, podemos intentar cargar los datos del usuario
  // (opcionalmente podemos decodificar el token o hacer una petición GET /users/{id})
  // Por ahora solo guardaremos los datos al loguearse/registrarse.
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Podríamos hacer userService.getUserById(id) pero no tenemos el id aún.
      // Una opción: guardar el usuario en localStorage al iniciar sesión.
      const savedUser = localStorage.getItem("auth_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (usernameOrEmail, password) => {
    const data = await authService.login(usernameOrEmail, password);
    const userData = {
      id: data.id,
      username: data.username,
      email: data.email,
      roles: data.roles,
      token: data.token,
    };
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    return userData;
  };

  const register = async (userData) => {
    const newUser = await userService.register(userData);
    // Después de registrar, podemos loguear automáticamente
    // o pedir que inicie sesión. Lo más cómodo es loguear.
    // Sin embargo, /register no devuelve token, así que haremos login después.
    // Por simplicidad, vamos a loguear con las credenciales recién creadas.
    // Necesitamos usernameOrEmail y password (que ya tenemos en userData).
    await login(userData.email, userData.password);
    return newUser;
  };

  const logout = () => {
    authService.logout();    // elimina token de localStorage
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);