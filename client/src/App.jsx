import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import { getProfile, getWishlist } from './services/api';
import { CartProvider } from './context/CartContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch wishlist count from backend for authenticated user
  const fetchWishlistCount = async () => {
    try {
      const data = await getWishlist();
      setWishlistCount(data.count || (data.wishlist ? data.wishlist.length : 0));
    } catch (err) {
      console.error('Failed to fetch wishlist count:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlistCount();
    } else {
      setWishlistCount(0);
    }
  }, [user]);

  // Check auth session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem' }} />
      </div>
    );
  }

  return (
    <Router>
      <CartProvider user={user}>
        <div className="app-container">
          <Navbar
            user={user}
            setUser={setUser}
            wishlistCount={wishlistCount}
          />
          <Routes>
            {/* Root redirect */}
            <Route
              path="/"
              element={user ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />}
            />

            {/* Public Auth Routes */}
            <Route path="/register" element={user ? <Navigate to="/products" replace /> : <Register />} />
            <Route path="/login" element={user ? <Navigate to="/products" replace /> : <Login setUser={setUser} />} />

            {/* Protected Customer Routes (Strictly Requires User Authentication) */}
            <Route
              path="/home"
              element={user ? <Home user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/products"
              element={
                user ? (
                  <Products
                    user={user}
                    onWishlistChange={fetchWishlistCount}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/products/:id"
              element={
                user ? (
                  <ProductDetails
                    user={user}
                    onWishlistChange={fetchWishlistCount}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/wishlist"
              element={
                user ? (
                  <Wishlist
                    user={user}
                    onWishlistChange={(items) => setWishlistCount(items ? items.length : 0)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/cart"
              element={user ? <Cart user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/checkout"
              element={user ? <Checkout user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/order-success/:id"
              element={user ? <OrderSuccess user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/orders"
              element={user ? <Orders user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/orders/:id"
              element={user ? <OrderSuccess user={user} /> : <Navigate to="/login" replace />}
            />

            {/* Fallback route */}
            <Route
              path="*"
              element={user ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
