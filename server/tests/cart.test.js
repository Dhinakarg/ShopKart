import request from 'supertest';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock Customer and Product models
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
    find: jest.fn()
  };
  return {
    default: mockProduct,
    __esModule: true
  };
});

const Customer = (await import('../models/customer.model.js')).default;
const Product = (await import('../models/product.model.js')).default;
const app = (await import('../index.js')).default;

describe('ShopKart Cart APIs Suite', () => {
  const secret = process.env.JWT_SECRET || 'ShopKart_JWT_SECRET_KEY_0123';
  const mockUserId = '66d000000000000000000099';
  const validToken = jwt.sign({ id: mockUserId }, secret, { expiresIn: '1h' });

  const mockProduct1 = {
    _id: '66d000000000000000000001',
    name: 'Mechanical Keyboard',
    description: 'RGB Mechanical Gaming Keyboard',
    price: 2999,
    category: 'Electronics',
    stock: 10
  };

  const mockProduct2 = {
    _id: '66d000000000000000000002',
    name: 'Gaming Mouse',
    description: 'Ergonomic mouse with 16000 DPI',
    price: 1499,
    category: 'Electronics',
    stock: 5
  };

  const mockOutOfStockProduct = {
    _id: '66d000000000000000000003',
    name: 'Sold Out Item',
    description: 'Out of stock item',
    price: 999,
    category: 'Electronics',
    stock: 0
  };

  let mockUserDoc;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserDoc = {
      _id: mockUserId,
      fullName: 'Test User',
      email: 'test@example.com',
      cart: [],
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
      then: (resolve) => resolve(resultData),
      catch: (reject) => {}
    };
    return query;
  };

  // =========================================
  // TASK 2: POST /cart/:productId (Add to Cart)
  // =========================================
  describe('POST /cart/:productId', () => {
    it('should return 401 Unauthorized if unauthenticated', async () => {
      const res = await request(app).post(`/cart/${mockProduct1._id}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 Bad Request for invalid product ID format', async () => {
      const res = await request(app)
        .post('/cart/invalid-id')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid Product ID');
    });

    it('should return 404 Not Found if product does not exist', async () => {
      Product.findById.mockResolvedValue(null);

      const res = await request(app)
        .post(`/cart/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });

    it('should return 400 Bad Request if product is out of stock', async () => {
      Product.findById.mockResolvedValue(mockOutOfStockProduct);

      const res = await request(app)
        .post(`/cart/${mockOutOfStockProduct._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Product is out of stock');
    });

    it('should add a new product to cart with default quantity 1', async () => {
      Product.findById.mockResolvedValue(mockProduct1);

      const res = await request(app)
        .post(`/cart/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockUserDoc.save).toHaveBeenCalled();
      expect(mockUserDoc.cart).toHaveLength(1);
      expect(mockUserDoc.cart[0].product).toBe(mockProduct1._id);
      expect(mockUserDoc.cart[0].quantity).toBe(1);
    });

    it('should increment quantity when adding the same product again', async () => {
      Product.findById.mockResolvedValue(mockProduct1);
      mockUserDoc.cart = [{ product: mockProduct1._id, quantity: 1 }];

      const res = await request(app)
        .post(`/cart/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(mockUserDoc.save).toHaveBeenCalled();
      expect(mockUserDoc.cart[0].quantity).toBe(2);
    });

    it('should reject request if total quantity exceeds stock limit', async () => {
      Product.findById.mockResolvedValue(mockProduct2); // stock = 5
      mockUserDoc.cart = [{ product: mockProduct2._id, quantity: 5 }];

      const res = await request(app)
        .post(`/cart/${mockProduct2._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('exceeds available stock');
    });
  });

  // =========================================
  // TASK 3: GET /cart (Get Cart)
  // =========================================
  describe('GET /cart', () => {
    it('should return 401 Unauthorized if unauthenticated', async () => {
      const res = await request(app).get('/cart');
      expect(res.status).toBe(401);
    });

    it('should return 200 OK with populated cart items', async () => {
      const populatedUser = {
        ...mockUserDoc,
        cart: [{ product: mockProduct1, quantity: 2 }]
      };

      Customer.findById.mockImplementation(() => createMockQuery(populatedUser));

      const res = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart).toHaveLength(1);
      expect(res.body.cart[0].quantity).toBe(2);
      expect(res.body.cart[0].product._id).toBe(mockProduct1._id);
    });
  });

  // =========================================
  // TASK 4: PATCH /cart/:productId (Update Quantity)
  // =========================================
  describe('PATCH /cart/:productId', () => {
    it('should return 401 Unauthorized if unauthenticated', async () => {
      const res = await request(app).patch(`/cart/${mockProduct1._id}`).send({ quantity: 3 });
      expect(res.status).toBe(401);
    });

    it('should return 400 Bad Request if quantity is less than 1', async () => {
      const res = await request(app)
        .patch(`/cart/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ quantity: 0 });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Quantity must be at least 1');
    });

    it('should return 404 Not Found if product is not in cart', async () => {
      Product.findById.mockResolvedValue(mockProduct1);
      mockUserDoc.cart = [];

      const res = await request(app)
        .patch(`/cart/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ quantity: 3 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Product not in cart');
    });

    it('should return 400 Bad Request if requested quantity exceeds stock', async () => {
      Product.findById.mockResolvedValue(mockProduct2); // stock = 5
      mockUserDoc.cart = [{ product: mockProduct2._id, quantity: 2 }];

      const res = await request(app)
        .patch(`/cart/${mockProduct2._id}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ quantity: 10 });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('exceeds available stock');
    });

    it('should update quantity successfully when valid', async () => {
      Product.findById.mockResolvedValue(mockProduct1); // stock = 10
      mockUserDoc.cart = [{ product: mockProduct1._id, quantity: 1 }];

      const res = await request(app)
        .patch(`/cart/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ quantity: 3 });

      expect(res.status).toBe(200);
      expect(mockUserDoc.save).toHaveBeenCalled();
      expect(mockUserDoc.cart[0].quantity).toBe(3);
    });
  });

  // =========================================
  // TASK 5: DELETE /cart/:productId (Remove from Cart)
  // =========================================
  describe('DELETE /cart/:productId', () => {
    it('should return 401 Unauthorized if unauthenticated', async () => {
      const res = await request(app).delete(`/cart/${mockProduct1._id}`);
      expect(res.status).toBe(401);
    });

    it('should return 404 Not Found if product is not in cart', async () => {
      mockUserDoc.cart = [];

      const res = await request(app)
        .delete(`/cart/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Product not in cart');
    });

    it('should remove product from cart when present', async () => {
      mockUserDoc.cart = [
        { product: mockProduct1._id, quantity: 2 },
        { product: mockProduct2._id, quantity: 1 }
      ];

      const res = await request(app)
        .delete(`/cart/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(mockUserDoc.save).toHaveBeenCalled();
      expect(mockUserDoc.cart).toHaveLength(1);
      expect(mockUserDoc.cart[0].product).toBe(mockProduct2._id);
    });
  });
});
