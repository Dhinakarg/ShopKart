import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/order.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';

const orderRoutes = express.Router();

// Protect all order endpoints
orderRoutes.use(isAuthenticated);

orderRoutes.post('/create-payment-order', createPaymentOrder);
orderRoutes.post('/verify-payment', verifyPayment);
orderRoutes.get('/', getMyOrders);
orderRoutes.get('/:id', getOrderById);
orderRoutes.patch('/:id/status', updateOrderStatus);

export default orderRoutes;
