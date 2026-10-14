import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.PROD) {
    return '';
  }
  return 'http://localhost:8085';
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Customer API Endpoints
export const registerCustomer = async (customerData) => {
  const response = await API.post('/customers/register', customerData);
  return response.data;
};

export const loginCustomer = async (credentials) => {
  const response = await API.post('/customers/login', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await API.get('/customers/me');
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await API.post('/customers/logout');
  return response.data;
};

// Product API Endpoints
export const getProducts = async (params = {}) => {
  const response = await API.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await API.post('/products', productData);
  return response.data;
};

export const seedProducts = async () => {
  const response = await API.get('/products/seed');
  return response.data;
};

// Wishlist API Endpoints
export const getWishlist = async () => {
  const response = await API.get('/wishlist');
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await API.post(`/wishlist/${productId}`);
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await API.delete(`/wishlist/${productId}`);
  return response.data;
};

export const toggleWishlist = async (productId) => {
  const response = await API.patch(`/wishlist/${productId}/toggle`);
  return response.data;
};

// Cart API Endpoints
export const getCart = async () => {
  const response = await API.get('/cart');
  return response.data;
};

export const addToCartApi = async (productId, quantity = 1) => {
  const response = await API.post(`/cart/${productId}`, { quantity });
  return response.data;
};

export const updateCartQuantityApi = async (productId, quantity) => {
  const response = await API.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

export const removeFromCartApi = async (productId) => {
  const response = await API.delete(`/cart/${productId}`);
  return response.data;
};

// Order API Endpoints
export const createPaymentOrderApi = async (shippingAddress) => {
  const response = await API.post('/orders/create-payment-order', { shippingAddress });
  return response.data;
};

export const verifyPaymentApi = async (paymentData) => {
  const response = await API.post('/orders/verify-payment', paymentData);
  return response.data;
};

export const getOrdersApi = async () => {
  const response = await API.get('/orders');
  return response.data;
};

export const getOrderByIdApi = async (id) => {
  const response = await API.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatusApi = async (id, status) => {
  const response = await API.patch(`/orders/${id}/status`, { status });
  return response.data;
};

export default API;
