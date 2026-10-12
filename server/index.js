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

const isJest = process.argv.some((arg) => arg.includes('jest')) || process.env.NODE_ENV === 'test';
dotenv.config();
if (!isJest) {
  dotenv.config({ override: true });
} else {
  process.env.NODE_ENV = 'test';
}

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://localhost:5000'],
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

app.post('/login', (req, res, next) => {
  req.url = '/login';
  customerRoutes(req, res, next);
});

app.post('/register', (req, res, next) => {
  req.url = '/register';
  customerRoutes(req, res, next);
});

app.get('/', (req, res) => {
  res.send('ShopKart API Server is running...');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    const mongoUri = process.env.dbUrl || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

    mongoose
      .connect(mongoUri)
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => {
        console.log('MongoDB connection error:', err.message);
        const fallbackUri = 'mongodb://127.0.0.1:27017/shopkart';
        if (mongoUri !== fallbackUri) {
          mongoose
            .connect(fallbackUri)
            .then(() => console.log('Connected to fallback MongoDB'))
            .catch((fErr) => console.log('Fallback connection error:', fErr.message));
        }
      });
  });
}

export default app;
