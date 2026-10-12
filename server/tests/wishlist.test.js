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

describe('ShopKart Wishlist APIs Suite', () => {
  const secret = process.env.JWT_SECRET || 'shopkart_super_secret_jwt_key_2026';
  const mockUserId = '66d000000000000000000099';
  const validToken = jwt.sign({ id: mockUserId }, secret, { expiresIn: '1h' });

  const mockProduct1 = {
    _id: '66d000000000000000000001',
    name: 'Headphones',
    description: 'Wireless noise-cancelling headphones',
    price: 4999,
    category: 'Electronics',
    image: 'https://example.com/headphones.jpg',
    stock: 25
  };

  let mockUserDoc;

  const createMockQuery = (doc) => {
    const promise = Promise.resolve(doc);
    promise.select = jest.fn().mockImplementation(() => Promise.resolve(doc));
    promise.populate = jest.fn().mockImplementation(() => Promise.resolve(doc));
    return promise;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserDoc = {
      _id: mockUserId,
      fullName: 'Test Customer',
      email: 'test@example.com',
      wishlist: [],
      save: jest.fn().mockResolvedValue(true)
    };
  });

  // =========================================
  // TASK 2: POST /wishlist/:productId (Add to Wishlist)
  // =========================================
  describe('POST /wishlist/:productId', () => {
    it('should return 401 Unauthorized if request is not authenticated', async () => {
      const res = await request(app).post(`/wishlist/${mockProduct1._id}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 Bad Request if productId is invalid hex format', async () => {
      Customer.findById.mockImplementation(() => createMockQuery(mockUserDoc));

      const res = await request(app)
        .post('/wishlist/invalid-id-123')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid Product ID format');
    });

    it('should return 404 Product Not Found if product does not exist', async () => {
      Customer.findById.mockImplementation(() => createMockQuery(mockUserDoc));
      Product.findById.mockResolvedValue(null);

      const res = await request(app)
        .post(`/wishlist/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Product not found');
    });

    it('should return 409 Conflict if product is already in user wishlist', async () => {
      const existingWishlistUser = {
        ...mockUserDoc,
        wishlist: [mockProduct1._id]
      };
      Customer.findById.mockImplementation(() => createMockQuery(existingWishlistUser));
      Product.findById.mockResolvedValue(mockProduct1);

      const res = await request(app)
        .post(`/wishlist/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already in wishlist');
    });

    it('should add product to wishlist and return 200/201 success', async () => {
      Customer.findById.mockImplementation(() => createMockQuery(mockUserDoc));
      Product.findById.mockResolvedValue(mockProduct1);

      const res = await request(app)
        .post(`/wishlist/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('added to wishlist');
      expect(mockUserDoc.save).toHaveBeenCalled();
    });
  });

  // =========================================
  // TASK 3: GET /wishlist (Get Current User Wishlist)
  // =========================================
  describe('GET /wishlist', () => {
    it('should return 401 Unauthorized if unauthenticated', async () => {
      const res = await request(app).get('/wishlist');
      expect(res.status).toBe(401);
    });

    it('should return 200 OK with populated wishlist array and count', async () => {
      const populatedUser = {
        ...mockUserDoc,
        wishlist: [mockProduct1]
      };

      Customer.findById.mockImplementation(() => createMockQuery(populatedUser));

      const res = await request(app)
        .get('/wishlist')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.wishlist).toHaveLength(1);
      expect(res.body.wishlist[0].name).toBe('Headphones');
    });
  });

  // =========================================
  // TASK 4: DELETE /wishlist/:productId (Remove from Wishlist)
  // =========================================
  describe('DELETE /wishlist/:productId', () => {
    it('should return 401 Unauthorized if unauthenticated', async () => {
      const res = await request(app).delete(`/wishlist/${mockProduct1._id}`);
      expect(res.status).toBe(401);
    });

    it('should return 404 if product is not in user wishlist', async () => {
      Customer.findById.mockImplementation(() => createMockQuery(mockUserDoc));

      const res = await request(app)
        .delete(`/wishlist/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not in wishlist');
    });

    it('should remove product from wishlist and return 200 success', async () => {
      const userWithWishlist = {
        ...mockUserDoc,
        wishlist: [mockProduct1._id],
        save: jest.fn().mockResolvedValue(true)
      };

      Customer.findById.mockImplementation(() => createMockQuery(userWithWishlist));

      const res = await request(app)
        .delete(`/wishlist/${mockProduct1._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removed from wishlist');
      expect(userWithWishlist.save).toHaveBeenCalled();
    });
  });

  // =========================================
  // TASK 23: PATCH /wishlist/:productId/toggle (Bonus Toggle)
  // =========================================
  describe('PATCH /wishlist/:productId/toggle', () => {
    it('should toggle product status in wishlist and return 200 OK', async () => {
      Customer.findById.mockImplementation(() => createMockQuery(mockUserDoc));
      Product.findById.mockResolvedValue(mockProduct1);

      const res = await request(app)
        .patch(`/wishlist/${mockProduct1._id}/toggle`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.saved).toBe(true);
    });
  });
});
