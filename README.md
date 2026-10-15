# ShopKart 🛒

A modern, full-stack e-commerce platform built with the **MERN** stack (MongoDB, Express.js, React, Node.js), featuring secure cookie-based JWT authentication, real-time product discovery, relational wishlist and cart management, and end-to-end payment processing with **Razorpay**.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
- **Bcrypt Password Hashing:** Secure one-way password encryption with salt rounds.
- **JWT in HttpOnly Cookies:** Protection against Cross-Site Scripting (XSS) attacks by keeping authentication tokens inaccessible to client-side scripts.
- **Protected Endpoints:** Middleware-based verification extracting user identity strictly from the verified JWT token (`req.user`).
- **Account Management:** User registration, login, logout, profile retrieval, and password updates.

### 🛍️ 2. Product Catalog & Discovery
- **Dynamic Catalog:** MongoDB-backed product management with categories, live stock levels, and high-resolution images.
- **Search & Filtering:** Case-insensitive product search and category filtering.
- **Price Sorting:** Dynamic sorting by price (ascending and descending).
- **Responsive UI States:** Tailored loading skeletons, error recovery banners, and empty search states.
- **Product Details:** Dedicated product overview page with inventory status and instant cart/wishlist actions.

### ❤️ 3. Persistent Wishlist
- **Relational Data Modeling:** Stores clean `Product` ObjectId references to keep catalog updates as the single source of truth.
- **Duplicate Prevention:** Prevents redundant wishlist entries per customer.
- **Populated Queries:** Efficiently hydrats product details using Mongoose `.populate()`.
- **Wishlist Toggle & Live Count:** Instant item toggle with a dynamic navbar badge reflecting real-time saved count.

### 🛒 4. Shopping Cart & Global State
- **Quantity Management:** Increment and decrement controls with real-time stock boundary checks.
- **Derived Totals:** Subtotal and total item counts calculated dynamically without storing stale computed values.
- **Centralized State:** React Context API (`CartContext`) keeps the cart page, product cards, and navbar item counts synchronized without page refreshes.

### 💳 5. Checkout & Razorpay Payment Integration
- **Shipping Address Form:** Comprehensive client-side and server-side validation.
- **Server Stock & Price Verification:** Re-validates inventory levels and recalculates order totals server-side prior to order creation.
- **Razorpay Standard Web Checkout:** Seamless modal integration with currency conversion (paise/INR) and prefilled customer details.
- **HMAC SHA-256 Signature Verification:** Server-side cryptographic verification verifying payment integrity before updating orders to `PAID` and clearing user carts.
- **Historical Snapshots:** Order documents preserve the exact product title, price, and quantity at the time of purchase.

### 📦 6. Orders & Order History
- **Order Tracking:** Track past orders with date, status badges (`PLACED`, `CONFIRMED`, `SHIPPED`, `DELIVERED`), and itemized breakdowns.
- **Order Security:** Strict ownership enforcement preventing users from viewing orders belonging to others.

---

## 🏗️ Architecture & User Journey

```text
Browse Catalog & Search
       ↓
Add to Wishlist / Cart (Context State)
       ↓
Proceed to Checkout & Shipping Details
       ↓
Server Validates Stock & Calculates Total
       ↓
Razorpay Order Generated (Paise)
       ↓
Client Opens Razorpay Payment Modal
       ↓
Backend Verifies HMAC SHA-256 Signature
       ↓
Order Marked PAID & Stock Deducted
       ↓
Cart Cleared & Confirmation Page
       ↓
Order History (/orders)
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **React Router DOM v6** (Client-side routing)
- **Axios** (`withCredentials: true` for cookie transport)
- **Lucide React** (Modern iconography)
- **Vanilla CSS** (Custom responsive design system with animations)

### Backend
- **Node.js & Express.js** (REST API)
- **MongoDB & Mongoose** (Relational schemas & references)
- **JSON Web Tokens (JWT)** (Session management)
- **bcryptjs** (Password hashing)
- **cookie-parser** (HttpOnly cookie handling)
- **Razorpay SDK & Node Crypto** (Payment generation & HMAC verification)

### Testing
- **Jest (ESM Modules)** & **Supertest**
- **60 Automated Unit & Integration Tests Passing (100% Pass Rate)**

---

## 📁 Project Structure

```text
ShopKart/
├── client/                     # Frontend React application (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, ProductCard, SearchBar, CartModal)
│   │   ├── context/            # Global state (CartContext)
│   │   ├── pages/              # Views (Home, Login, Register, Products, ProductDetails, Wishlist, Cart, Checkout, Orders, OrderSuccess)
│   │   ├── services/           # API service layer (Axios)
│   │   ├── App.jsx             # Main routing & state setup
│   │   ├── index.css           # Global stylesheet & design tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Backend API server (Express)
    ├── config/                 # Razorpay gateway configuration
    ├── controllers/            # Route controllers (customer, product, cart, wishlist, order)
    ├── middlewares/            # Auth & JWT verification middleware
    ├── models/                 # Mongoose schemas (Customer, Product, Order)
    ├── routes/                 # Express route definitions
    ├── tests/                  # Jest test suites (customer, product, cart, wishlist, order)
    ├── utils/                  # Token generation utility
    ├── index.js                # Server entrypoint
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **npm** or **yarn**

---

### 1. Clone the Repository
```bash
git clone https://github.com/Dhinakarg/ShopKart.git
cd ShopKart
```

---

### 2. Backend Setup (`server`)
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `server/` (refer to `.env.example`):
   ```env
   PORT=8085
   MONGO_URI=mongodb://localhost:27017/shopkart
   JWT_SECRET=your_jwt_secret_key_here
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run at `http://localhost:8085`.

---

### 3. Frontend Setup (`client`)
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `client/` (refer to `.env.example`):
   ```env
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will run at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

The backend test suite covers all API endpoints, validation logic, authentication gates, cart calculations, and signature verification:

```bash
cd server
npm test
```

### Test Coverage Highlights:
- **`customer.test.js`**: Registration validation, duplicate checks, login, password checks, profile access, password changes.
- **`product.test.js`**: Product creation, catalog query filtering, case-insensitive search, price sorting.
- **`wishlist.test.js`**: Wishlist addition, duplication prevention, population, item removal, toggling.
- **`cart.test.js`**: Cart additions, inventory limit validation, quantity updates, item deletions.
- **`order.test.js`**: Address validation, stock deduction, order snapshots, signature verification, cart clearing.

```text
Test Suites: 5 passed, 5 total
Tests:       60 passed, 60 total
Snapshots:   0 total
```

---

## 📡 API Reference Summary

| Method | Endpoint | Auth Required | Purpose |
|---|---|:---:|---|
| `POST` | `/customers/register` | No | Register a new customer |
| `POST` | `/customers/login` | No | Login customer & issue HttpOnly JWT |
| `GET` | `/customers/me` | Yes | Get authenticated user profile |
| `POST` | `/customers/logout` | Yes | Clear auth cookie |
| `PATCH` | `/customers/change-password` | Yes | Update account password |
| `GET` | `/products` | No | Get products (supports `?search=`, `?category=`, `?sort=`) |
| `GET` | `/products/:id` | No | Get single product details |
| `POST` | `/products` | No | Create new product |
| `GET` | `/wishlist` | Yes | Get populated wishlist for current user |
| `POST` | `/wishlist/:productId` | Yes | Add item to wishlist |
| `DELETE` | `/wishlist/:productId` | Yes | Remove item from wishlist |
| `PATCH` | `/wishlist/:productId/toggle` | Yes | Toggle item in wishlist |
| `GET` | `/cart` | Yes | Get populated shopping cart |
| `POST` | `/cart/:productId` | Yes | Add item to cart |
| `PATCH` | `/cart/:productId` | Yes | Update item quantity |
| `DELETE` | `/cart/:productId` | Yes | Remove item from cart |
| `POST` | `/orders/create-payment-order` | Yes | Validate stock & create Razorpay order |
| `POST` | `/orders/verify-payment` | Yes | Verify HMAC signature & place order |
| `GET` | `/orders` | Yes | Get current user's order history |
| `GET` | `/orders/:id` | Yes | Get order details by ID |
| `PATCH` | `/orders/:id/status` | Yes | Update order status (`PLACED`, `CONFIRMED`, `SHIPPED`, `DELIVERED`) |

---

## 🔒 Security Best Practices Implemented
- Strict input sanitization and boundary validations on all inputs.
- Authentication credentials stored only in secure `HttpOnly` cookies.
- Server-side inventory re-check and total calculation preventing client payload tampering.
- HMAC SHA-256 cryptographic verification for all payment transactions.
- Zero credential exposure: sensitive keys (`JWT_SECRET`, `RAZORPAY_KEY_SECRET`) are strictly maintained on the backend.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
