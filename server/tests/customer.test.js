import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { jest } from '@jest/globals';

// Mock model before importing app
jest.unstable_mockModule('../models/customer.model.js', () => {
  const mockCustomer = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn()
  };
  return {
    default: mockCustomer,
    __esModule: true
  };
});

const Customer = (await import('../models/customer.model.js')).default;
const app = (await import('../index.js')).default;

describe('ShopKart Customer Authentication API Suite (ESM)', () => {
  const secret = process.env.JWT_SECRET || 'shopkart_super_secret_jwt_key_2026';

  const samplePassword = 'john123password';
  const sampleHash = bcrypt.hashSync(samplePassword, 10);

  const mockCustomerData = {
    _id: '65f1a2b3c4d5e6f7a8b9c0d1',
    fullName: 'John Doe',
    email: 'john@gmail.com',
    password: sampleHash,
    phone: '9876543210',
    createdAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================
  // TASK 1: POST /customers/register
  // =========================================
  describe('POST /customers/register', () => {
    it('should register a customer successfully with status 201', async () => {
      Customer.findOne.mockResolvedValue(null);
      Customer.create.mockResolvedValue(mockCustomerData);

      const res = await request(app)
        .post('/customers/register')
        .send({
          fullName: 'John Doe',
          email: 'john@gmail.com',
          password: 'john123password',
          phone: '9876543210'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Customer registered successfully');
      expect(res.body.customer).toBeDefined();
      expect(res.body.customer.fullName).toBe('John Doe');
      expect(res.body.customer.email).toBe('john@gmail.com');
      expect(res.body.customer.phone).toBe('9876543210');
      expect(res.body.customer.password).toBeUndefined();
    });

    it('should return 400 Bad Request if mandatory fields are missing', async () => {
      const res = await request(app)
        .post('/customers/register')
        .send({
          fullName: 'John Doe',
          email: 'john@gmail.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should return 400 Bad Request if password length is < 6 characters', async () => {
      const res = await request(app)
        .post('/customers/register')
        .send({
          fullName: 'John Doe',
          email: 'john@gmail.com',
          password: '123',
          phone: '9876543210'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 6 characters');
    });

    it('should return 409 Conflict if email already exists', async () => {
      Customer.findOne.mockResolvedValue(mockCustomerData);

      const res = await request(app)
        .post('/customers/register')
        .send({
          fullName: 'John Doe',
          email: 'john@gmail.com',
          password: 'john123password',
          phone: '9876543210'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email already registered');
    });

    it('should return 400 Bad Request if confirmPassword does not match password', async () => {
      const res = await request(app)
        .post('/customers/register')
        .send({
          fullName: 'John Doe',
          email: 'john@gmail.com',
          password: 'john123password',
          confirmPassword: 'differentPassword',
          phone: '9876543210'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Passwords do not match');
    });
  });

  // =========================================
  // TASK 2: POST /customers/login
  // =========================================
  describe('POST /customers/login', () => {
    it('should log in successfully and set HttpOnly cookie token', async () => {
      Customer.findOne.mockResolvedValue(mockCustomerData);

      const res = await request(app)
        .post('/customers/login')
        .send({
          email: 'john@gmail.com',
          password: samplePassword
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('token='))).toBe(true);
      expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true);
    });

    it('should return 401 Unauthorized for non-existent email', async () => {
      Customer.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/customers/login')
        .send({
          email: 'nonexistent@gmail.com',
          password: 'john123password'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  // =========================================
  // TASK 3: GET /customers/me
  // =========================================
  describe('GET /customers/me', () => {
    it('should return profile data for authenticated customer', async () => {
      const token = jwt.sign({ id: mockCustomerData._id }, secret, { expiresIn: '1d' });

      const selectMock = jest.fn().mockResolvedValue({
        _id: mockCustomerData._id,
        fullName: mockCustomerData.fullName,
        email: mockCustomerData.email,
        phone: mockCustomerData.phone
      });
      Customer.findById.mockReturnValue({ select: selectMock });

      const res = await request(app)
        .get('/customers/me')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('john@gmail.com');
      expect(res.body.fullName).toBe('John Doe');
      expect(res.body.phone).toBe('9876543210');
    });

    it('should return 401 Unauthorized if cookie token is missing', async () => {
      const res = await request(app).get('/customers/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authenticated');
    });
  });

  // =========================================
  // TASK 4: POST /customers/logout
  // =========================================
  describe('POST /customers/logout', () => {
    it('should clear authentication cookie and return success message', async () => {
      const token = jwt.sign({ id: mockCustomerData._id }, secret, { expiresIn: '1d' });
      Customer.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockCustomerData)
      });

      const res = await request(app)
        .post('/customers/logout')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('token=;') || c.includes('Expires=Thu, 01 Jan 1970'))).toBe(true);
    });
  });
});
