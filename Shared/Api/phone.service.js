
import { http } from "./http.js";

export const phoneService = {
  getList: () => http.get("/Products"),
  getById: (id) => http.get(`/Products/${id}`),
  deleteById: (id) => http.delete(`/Products/${id}`),
  createProduct: (data) => http.post("/Products", data),
  updateProduct: (id, data) => http.put(`/Products/${id}`, data), 
};
