const BASE_URL = "https://68b3d15c45c90167876ee94d.mockapi.io";


let api = axios.create({
    baseURL: BASE_URL,
    headers: {"content-type" : "application/json"},
    timeout: 2000,
})


let phoneService = {

getList: () => api.get("/Products"),
getById: (id) => api.get(`/Products/${id}`),
deleteById: (idProduct) => api.delete(`/Products/${idProduct}`),
createProduct: (newProduct) => api.post("/Products", newProduct),
updateProduct: (edittingId , updateProduct) => api.put(`/Products/${edittingId}`, updateProduct),
}