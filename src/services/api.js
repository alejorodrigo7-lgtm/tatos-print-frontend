import axios from 'axios';

export const API_URL =
  import.meta.env.VITE_API_URL || 'https://tatos-print-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

export const productosAPI = {
  listar: (params) => api.get('/productos', { params }),
  obtener: (id) => api.get(`/productos/${id}`),
  crear: (data) => api.post('/productos', data),
  actualizar: (id, data) => api.put(`/productos/${id}`, data),
  eliminar: (id) => api.delete(`/productos/${id}`),
};

export const categoriasAPI = {
  listar: () => api.get('/categorias'),
  crear: (data) => api.post('/categorias', data),
  actualizar: (id, data) => api.put(`/categorias/${id}`, data),
  eliminar: (id) => api.delete(`/categorias/${id}`),
};

export const clientesAPI = {
  registrar: (data) => api.post('/clientes/registro', data),
  login: (data) => api.post('/clientes/login', data),
  perfil: () => api.get('/clientes/perfil'),
};

export const pedidosAPI = {
  crear: (data) => api.post('/pedidos', data),
  misPedidos: () => api.get('/pedidos/mis-pedidos'),
  listar: (params) => api.get('/pedidos', { params }),
  obtener: (id) => api.get(`/pedidos/${id}`),
  seguimiento: (codigo) => api.get(`/pedidos/seguimiento/${encodeURIComponent(codigo)}`),
  actualizarEstado: (id, estado) => api.put(`/pedidos/${id}/estado`, { estado }),
};

export const cuponesAPI = {
  listar: () => api.get('/cupones'),
  crear: (data) => api.post('/cupones', data),
  validar: (codigo) => api.post('/cupones/validar', { codigo }),
  eliminar: (id) => api.delete(`/cupones/${id}`),
};

export const personalizadosAPI = {
  crear: (data) => api.post('/personalizados', data),
  listar: () => api.get('/personalizados'),
  actualizar: (id, data) => api.put(`/personalizados/${id}`, data),
  eliminar: (id) => api.delete(`/personalizados/${id}`),
};

export const uploadAPI = {
  // Para el panel admin (requiere rol admin)
  subir: (formData) =>
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Para clientes logueados (personalizados)
  subirCliente: (formData) =>
    api.post('/upload/cliente', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Múltiples imágenes (admin)
  subirMultiples: (formData) =>
    api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Eliminar imagen (admin)
  eliminar: (publicId) => api.delete(`/upload/${encodeURIComponent(publicId)}`),
};