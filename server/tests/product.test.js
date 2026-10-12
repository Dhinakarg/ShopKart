import request from 'supertest';
import { jest } from '@jest/globals';

// Mock Product model
jest.unstable_mockModule('../models/product.model.js', () => {
  const mockProduct = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    insertMany: jest.fn()
  };
  return {
    default: mockProduct,
    __esModule: true
  };
});

const Product = (await import('../models/product.model.js')).default;
const app = (await import('../index.js')).default;

describe('ShopKart Product APIs Suite', () => {
  const sampleProduct = {
    _id: '66d123abc456789012345678',
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB mechanical keyboard with blue switches',
    price: 2999,
    category: 'Electronics',
    image: 'https://example.com/keyboard.jpg',
    stock: 10,
    createdAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================
  // TASK 2: POST /products (Create Product)
  // =========================================
  describe('POST /products', () => {
    it('should create a product successfully with status 201', async () => {
      Product.create.mockResolvedValue(sampleProduct);

      const res = await request(app)
        .post('/products')
        .send({
          name: 'Mechanical Gaming Keyboard',
          description: 'RGB mechanical keyboard with blue switches',
          price: 2999,
          category: 'Electronics',
          image: 'https://example.com/keyboard.jpg',
          stock: 10
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.product).toBeDefined();
      expect(res.body.product.name).toBe('Mechanical Gaming Keyboard');
    });

    it('should return 400 Bad Request if mandatory fields are missing', async () => {
      const res = await request(app)
        .post('/products')
        .send({
          name: 'Incomplete Product'
          // missing description, price, category, image, stock
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should return 400 Bad Request if price is 0 or negative', async () => {
      const res = await request(app)
        .post('/products')
        .send({
          name: 'Free Item',
          description: 'Test description',
          price: 0,
          category: 'Electronics',
          image: 'https://example.com/item.jpg',
          stock: 5
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Price must be a number greater than 0');
    });

    it('should return 400 Bad Request if stock is negative', async () => {
      const res = await request(app)
        .post('/products')
        .send({
          name: 'Negative Stock Item',
          description: 'Test description',
          price: 100,
          category: 'Electronics',
          image: 'https://example.com/item.jpg',
          stock: -5
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Stock cannot be negative');
    });
  });

  // =========================================
  // TASK 3 & 5: GET /products (Listing, Search, Filter, Sort)
  // =========================================
  describe('GET /products', () => {
    it('should return all products with status 200', async () => {
      const sortMock = jest.fn().mockResolvedValue([sampleProduct]);
      Product.find.mockReturnValue({ sort: sortMock });

      const res = await request(app).get('/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(Array.isArray(res.body.products)).toBe(true);
    });

    it('should support search query parameter', async () => {
      const sortMock = jest.fn().mockResolvedValue([sampleProduct]);
      Product.find.mockReturnValue({ sort: sortMock });

      const res = await request(app).get('/products?search=keyboard');

      expect(res.status).toBe(200);
      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.objectContaining({ $regex: 'keyboard', $options: 'i' })
        })
      );
    });

    it('should support category query parameter', async () => {
      const sortMock = jest.fn().mockResolvedValue([sampleProduct]);
      Product.find.mockReturnValue({ sort: sortMock });

      const res = await request(app).get('/products?category=Electronics');

      expect(res.status).toBe(200);
      expect(Product.find).toHaveBeenCalled();
    });

    it('should support price_asc sorting parameter', async () => {
      const sortMock = jest.fn().mockResolvedValue([sampleProduct]);
      Product.find.mockReturnValue({ sort: sortMock });

      const res = await request(app).get('/products?sort=price_asc');

      expect(res.status).toBe(200);
      expect(sortMock).toHaveBeenCalledWith({ price: 1 });
    });
  });

  // =========================================
  // TASK 4: GET /products/:id (Single Product)
  // =========================================
  describe('GET /products/:id', () => {
    it('should return product details for a valid ID', async () => {
      Product.findById.mockResolvedValue(sampleProduct);

      const res = await request(app).get(`/products/${sampleProduct._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product._id).toBe(sampleProduct._id);
    });

    it('should return 400 Bad Request for invalid MongoDB ObjectId format', async () => {
      const res = await request(app).get('/products/invalid-id-123');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid product ID');
    });

    it('should return 404 Not Found if product does not exist', async () => {
      Product.findById.mockResolvedValue(null);

      const res = await request(app).get('/products/66d123abc456789012345999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });
  });
});
