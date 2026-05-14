// src/services/api/config.js
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL,
  HEADERS: {
    "Content-Type": "application/json",
  },
  ENDPOINTS: {
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
  },
};