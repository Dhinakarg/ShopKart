import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dns from 'dns';
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore DNS override errors
}

const isJest =
  process.env.JEST_WORKER_ID !== undefined ||
  process.env.NODE_ENV === 'test' ||
  process.argv.some((arg) => arg.includes('jest'));

if (isJest) {
  process.env.NODE_ENV = 'test';
} else {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 5000;

export const connectDb = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const mongoUri = process.env.dbUrl || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log('MongoDB connection error:', err.message);
    const fallbackUri = 'mongodb://127.0.0.1:27017/shopkart';
    if (mongoUri !== fallbackUri) {
      try {
        await mongoose.connect(fallbackUri);
        console.log('Connected to fallback MongoDB');
      } catch (fErr) {
        console.log('Fallback connection error:', fErr.message);
      }
    }
  }
};

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.post('/login', (req, res, next) => {
  req.url = '/login';
  customerRoutes(req, res, next);
});

app.post('/register', (req, res, next) => {
  req.url = '/register';
  customerRoutes(req, res, next);
});

app.post('/api/login', (req, res, next) => {
  req.url = '/login';
  customerRoutes(req, res, next);
});

app.post('/api/register', (req, res, next) => {
  req.url = '/register';
  customerRoutes(req, res, next);
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ShopKart API is running' });
});

app.get('/', (req, res) => {
  res.send('ShopKart API Server is running...');
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(port, async () => {
    console.log(`Server started on port ${port}`);
    await connectDb();
  });
}

export default app;
