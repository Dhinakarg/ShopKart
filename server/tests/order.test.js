import request from 'supertest';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock models
jest.unstable_mockModule('../models/customer.model.js', () => {
  const mockCustomer = {
    findById: jest.fn(),
    findOne: jest.fn()
  };
  return {
    default: mockCustomer,
    __esModule: true
  };
});

jest.unstable_mockModule('../models/product.model.js', () => {
  const mockProduct = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn()
  };
  return {
    default: mockProduct,
    __esModule: true
  };
});

jest.unstable_mockModule('../models/order.model.js', () => {
  const mockOrder = {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn()
  };
  return {
    default: mockOrder,
    __esModule: true
  };
});

const Customer = (await import('../models/customer.model.js')).default;
const Product = (await import('../models/product.model.js')).default;
const Order = (await import('../models/order.model.js')).default;
const app = (await import('../index.js')).default;

describe('ShopKart Checkout & Orders APIs Suite', () => {
  const secret = process.env.JWT_SECRET || 'ShopKart_JWT_SECRET_KEY_0123';
  const mockUserId = '66d000000000000000000099';
  const otherUserId = '66d000000000000000000088';
  const validToken = jwt.sign({ id: mockUserId }, secret, { expiresIn: '1h' });

  const mockProduct = {
    _id: '66d000000000000000000001',
    name: 'Mechanical Keyboard',
    description: 'RGB Mechanical Gaming Keyboard',
    price: 2999,
    category: 'Electronics',
    stock: 10,
    image: 'http://example.com/kb.jpg'
  };

  const validShippingAddress = {
    fullName: 'Aarav Sharma',
    phone: '9876543210',
    addressLine1: '22 MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001'
  };

  let mockUserDoc;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserDoc = {
      _id: mockUserId,
      fullName: 'Aarav Sharma',
      email: 'aarav@example.com',
      cart: [{ product: mockProduct, quantity: 2 }],
      save: jest.fn().mockResolvedValue(true)
    };

    Customer.findById.mockImplementation((id) => {
      if (id === mockUserId) {
        return createMockQuery(mockUserDoc);
      }
      return createMockQuery(null);
    });
  });

  const createMockQuery = (resultData) => {
    const query = {
      select: jest.fn().mockImplementation(() => query),
      populate: jest.fn().mockImplementation(() => query),
      sort: jest.fn().mockImplementation(() => query),
      then: (resolve) => resolve(resultData),
      catch: (reject) => {}
    };
    return query;
  };

  // =========================================
  // TASK 4: POST /orders/create-payment-order
  // =========================================
  describe('POST /orders/create-payment-order', () => {
    it('should return 401 Unauthorized if unauthenticated', async () => {
      const res = await request(app)
        .post('/orders/create-payment-order')
        .send({ shippingAddress: validShippingAddress });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 Bad Request if cart is empty', async () => {
      mockUserDoc.cart = [];

      const res = await request(app)
        .post('/orders/create-payment-order')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ shippingAddress: validShippingAddress });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('cart is empty');
    });

    it('should return 400 Bad Request if pincode validation fails', async () => {
      const res = await request(app)
        .post('/orders/create-payment-order')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          shippingAddress: { ...validShippingAddress, pincode: '123' }
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('6 digits');
    });

    it('should return 400 Bad Request if requested quantity exceeds latest stock', async () => {
      Product.findById.mockResolvedValue({ ...mockProduct, stock: 1 });

      const res = await request(app)
        .post('/orders/create-payment-order')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ shippingAddress: validShippingAddress });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Insufficient stock');
    });

    it('should calculate total on server, snapshot items, and return checkout data', async () => {
      Product.findById.mockResolvedValue(mockProduct);
      const createdOrderDoc = {
        _id: '67abc1234567890123456789',
        user: mockUserId,
        items: [{ product: mockProduct._id, name: 'Mechanical Keyboard', price: 2999, quantity: 2 }],
        totalAmount: 5998,
        paymentStatus: 'PENDING',
        status: 'PENDING_PAYMENT',
        save: jest.fn().mockResolvedValue(true)
      };
      Order.create.mockResolvedValue(createdOrderDoc);

      const res = await request(app)
        .post('/orders/create-payment-order')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          shippingAddress: validShippingAddress,
          totalAmount: 1 // Attempt to send fake total from frontend
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.totalAmount).toBe(5998); // Real calculated total: 2999 * 2
      expect(res.body.amount).toBe(599800); // 5998 * 100 paise
      expect(res.body.shopKartOrderId).toBe('67abc1234567890123456789');
    });
  });

  // =========================================
  // TASK 5: POST /orders/verify-payment
  // =========================================
  describe('POST /orders/verify-payment', () => {
    it('should return 401 Unauthorized if unauthenticated', async () => {
      const res = await request(app).post('/orders/verify-payment').send({});
      expect(res.status).toBe(401);
    });

    it('should return 403 Forbidden if user does not own the order', async () => {
      const otherOrderDoc = {
        _id: '67abc1234567890123456789',
        user: otherUserId,
        items: []
      };
      Order.findById.mockResolvedValue(otherOrderDoc);

      const res = await request(app)
        .post('/orders/verify-payment')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ shopKartOrderId: otherOrderDoc._id });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Unauthorized');
    });

    it('should verify payment signature, mark PAID, deduct stock, and clear user cart', async () => {
      const orderDoc = {
        _id: '67abc1234567890123456789',
        user: mockUserId,
        items: [{ product: mockProduct._id, quantity: 2 }],
        paymentStatus: 'PENDING',
        status: 'PENDING_PAYMENT',
        razorpayOrderId: 'order_67abc1234567890123456789',
        save: jest.fn().mockResolvedValue(true)
      };

      Order.findById.mockResolvedValue(orderDoc);
      Product.findByIdAndUpdate.mockResolvedValue(true);

      const res = await request(app)
        .post('/orders/verify-payment')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          shopKartOrderId: orderDoc._id,
          razorpay_order_id: 'order_67abc1234567890123456789',
          razorpay_payment_id: 'pay_999888777',
          razorpay_signature: 'test_signature_valid'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(orderDoc.paymentStatus).toBe('PAID');
      expect(orderDoc.status).toBe('PLACED');
      expect(mockUserDoc.cart).toEqual([]); // Cart cleared!
      expect(mockUserDoc.save).toHaveBeenCalled();
    });
  });

  // =========================================
  // TASK 7 & 8: GET /orders & GET /orders/:id
  // =========================================
  describe('GET /orders & GET /orders/:id', () => {
    it('GET /orders should return authenticated user orders', async () => {
      const userOrders = [
        { _id: 'order1', totalAmount: 5998, status: 'PLACED' }
      ];
      Order.find.mockImplementation(() => createMockQuery(userOrders));

      const res = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orders).toHaveLength(1);
    });

    it('GET /orders/:id should return 403 Forbidden if accessing another user order', async () => {
      const foreignOrder = {
        _id: '67abc1234567890123456789',
        user: otherUserId,
        totalAmount: 1000
      };
      Order.findById.mockResolvedValue(foreignOrder);

      const res = await request(app)
        .get(`/orders/${foreignOrder._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });

    it('GET /orders/:id should return single order details when owned by user', async () => {
      const ownOrder = {
        _id: '67abc1234567890123456789',
        user: mockUserId,
        totalAmount: 5998,
        status: 'PLACED'
      };
      Order.findById.mockResolvedValue(ownOrder);

      const res = await request(app)
        .get(`/orders/${ownOrder._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order._id).toBe(ownOrder._id);
    });
  });
});
