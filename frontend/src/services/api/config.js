// src/services/api/config.js
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL,
  HEADERS: {
    "Content-Type": "application/json",
  },
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
    },
    ROLES: {
      GET_ALL: "/roles",
      GET_BY_ID: (id) => `/roles/${id}`,
    },
    USERS: {
      REGISTER: "/users/register",
      GET_ALL: "/users",
      GET_BY_ID: (id) => `/users/${id}`,
      UPDATE: (id) => `/users/${id}`,
      DELETE: (id) => `/users/${id}`,
      ASSIGN_ROLE: (userId, roleTitle) => `/users/${userId}/roles/${roleTitle}`,
      REPLACE_ADDRESSES: (userId) => `/users/${userId}/addresses`,
    },
    ITEMS: {
      GET_ALL: "/items",
      GET_BY_ID: (id) => `/items/${id}`,
      SEARCH: (query) => `/items/search?query=${encodeURIComponent(query)}`,
      BY_CATEGORIES: (categoryIds) => {
        const params = categoryIds.map(id => `categoryIds=${id}`).join('&');
        return `/items/categories?${params}`;
      },
      CREATE: "/items",
      UPDATE: (id) => `/items/${id}`,
      DELETE: (id) => `/items/${id}`,
    },
    CATEGORIES: {
      MAIN: "/categories/main",
      SUB: (parentId) => `/categories/sub/${parentId}`,
    },
    CART: {
      GET: (customerId) => `/carts/${customerId}`,
      ADD_ITEM: "/carts/items",
      UPDATE_ITEM: "/carts/items",
      REMOVE_ITEM: (customerId, itemId) => `/carts/${customerId}/items/${itemId}`,
      EMPTY: (customerId) => `/carts/${customerId}/empty`,
    },
  },
};