import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dns from 'dns'
import customerRoutes from './routes/customer.routes.js'
import productRoutes from './routes/product.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'

try {
    dns.setDefaultResultOrder('ipv4first');
} catch {
    // Ignore DNS override errors
}

const isJest = process.argv.some(arg => arg.includes('jest')) || process.env.NODE_ENV === 'test';
dotenv.config();
if (!isJest) {
    dotenv.config({ override: true });
} else {
    process.env.NODE_ENV = 'test';
}

const app = express()
const Port = process.env.PORT || 5000

// Enable CORS for frontend dev servers with credentials enabled
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://localhost:5000'],
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Mounted routes
app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)

// Route Aliases for direct endpoint testing
app.post('/login', (req, res, next) => {
  req.url = '/login'
  customerRoutes(req, res, next)
})
app.post('/register', (req, res, next) => {
  req.url = '/register'
  customerRoutes(req, res, next)
})

app.get('/', (req, res) => {
    res.send('ShopKart API Server is running...')
})

if (process.env.NODE_ENV !== 'test') {
    app.listen(Port, () => {
        console.log(`Server started at ${Port}`)
        const primaryDbUrl = process.env.dbUrl || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';
        const localDbUrl = 'mongodb://127.0.0.1:27017/shopkart';

        mongoose.connect(primaryDbUrl)
            .then(() => {
                console.log("Db Connected")
            })
            .catch((err) => {
                console.log("Primary Database connection error:", err.message);
                if (primaryDbUrl !== localDbUrl) {
                    console.log("Attempting fallback connection to local MongoDB (mongodb://127.0.0.1:27017/shopkart)...");
                    mongoose.connect(localDbUrl)
                        .then(() => {
                            console.log("Db Connected (Fallback Local MongoDB)");
                        })
                        .catch((fallbackErr) => {
                            console.log("Fallback Database connection error:", fallbackErr.message);
                        });
                }
            });
    })
}

export default app
