// shared/api/http.js

export const API_BASE = "https://68b3d15c45c90167876ee94d.mockapi.io";

export const http = axios.create({
  baseURL: API_BASE,
  headers: { "content-type": "application/json" },
  timeout: 8000,
});
