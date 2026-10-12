import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = ({ user }) => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartLoading,
    cartError,
    actionLoadingId,
    cartCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    refreshCart
  } = useCart();

  const [itemError, setItemError] = useState({});

  if (!user) {
    navigate('/login');
    return null;
  }

  // Handle quantity increase
  const handleIncrease = async (item) => {
    const product = item.product;
    if (!product) return;

    if (item.quantity >= product.stock) {
      setItemError((prev) => ({
        ...prev,
        [product._id]: `Cannot add more. Only ${product.stock} units in stock.`
      }));
      setTimeout(() => {
        setItemError((prev) => ({ ...prev, [product._id]: null }));
      }, 3000);
      return;
    }

    try {
      setItemError((prev) => ({ ...prev, [product._id]: null }));
      await updateQuantity(product._id, item.quantity + 1);
    } catch (err) {
      setItemError((prev) => ({
        ...prev,
        [product._id]: err.message || 'Failed to update quantity.'
      }));
    }
  };

  // Handle quantity decrease
  const handleDecrease = async (item) => {
    const product = item.product;
    if (!product) return;

    if (item.quantity <= 1) {
      return;
    }

    try {
      setItemError((prev) => ({ ...prev, [product._id]: null }));
      await updateQuantity(product._id, item.quantity - 1);
    } catch (err) {
      setItemError((prev) => ({
        ...prev,
        [product._id]: err.message || 'Failed to update quantity.'
      }));
    }
  };

  // Handle item remove
  const handleRemove = async (productId) => {
    try {
      setItemError((prev) => ({ ...prev, [productId]: null }));
      await removeFromCart(productId);
    } catch (err) {
      setItemError((prev) => ({
        ...prev,
        [productId]: err.message || 'Failed to remove item.'
      }));
    }
  };

  // Currency formatter
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. Loading State
  if (cartLoading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (cartError && cartItems.length === 0) {
    return (
      <div className="page-container">
        <div style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <AlertCircle size={44} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Unable to load your cart.
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {cartError}
          </p>
          <button
            onClick={refreshCart}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (cartItems.length === 0) {
    return (
      <div className="page-container">
        <div style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          padding: '3rem 1.5rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#e0e7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <ShoppingCart size={32} style={{ color: 'var(--primary-color)' }} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Your cart is empty 🛒
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Looks like you haven't added anything yet. Explore our catalog to find items you love!
          </p>
          <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={18} />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  // 4. Cart View
  return (
    <div className="page-container" style={{ alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: '1024px' }}>
        {/* Navigation Back Link */}
        <Link
          to="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'var(--primary-color)',
            marginBottom: '1.25rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </Link>

        <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
          My Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              const isUpdating = actionLoadingId === product._id;
              const errMessage = itemError[product._id];
              const itemTotal = (product.price || 0) * item.quantity;

              return (
                <div
                  key={product._id}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Item Image */}
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '0.375rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="10">Image</text></svg>';
                      }}
                    />

                    {/* Item Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/products/${product._id}`}
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          textDecoration: 'none',
                          display: 'block',
                          marginBottom: '0.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {product.name}
                      </Link>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        {formatINR(product.price)} each
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>
                        {product.stock} units available in stock
                      </div>
                    </div>

                    {/* Item Total Price */}
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-color)', textAlign: 'right' }}>
                      {formatINR(itemTotal)}
                    </div>
                  </div>

                  {/* Actions & Quantity Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.75rem',
                    marginTop: '0.25rem'
                  }}>
                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDecrease(item)}
                        disabled={isUpdating || item.quantity <= 1}
                        title={item.quantity <= 1 ? "Minimum quantity reached. Use Remove button to delete." : "Decrease quantity"}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '0.375rem',
                          border: '1px solid #cbd5e1',
                          backgroundColor: item.quantity <= 1 ? '#f1f5f9' : '#ffffff',
                          color: item.quantity <= 1 ? '#94a3b8' : '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isUpdating || item.quantity <= 1 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Minus size={14} />
                      </button>

                      <span style={{
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        color: 'var(--text-main)',
                        minWidth: '24px',
                        textAlign: 'center'
                      }}>
                        {isUpdating ? '...' : item.quantity}
                      </span>

                      <button
                        onClick={() => handleIncrease(item)}
                        disabled={isUpdating || item.quantity >= product.stock}
                        title={item.quantity >= product.stock ? "Stock limit reached" : "Increase quantity"}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '0.375rem',
                          border: '1px solid #cbd5e1',
                          backgroundColor: item.quantity >= product.stock ? '#f1f5f9' : '#ffffff',
                          color: item.quantity >= product.stock ? '#94a3b8' : '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isUpdating || item.quantity >= product.stock ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Remove Item Button */}
                    <button
                      onClick={() => handleRemove(product._id)}
                      disabled={isUpdating}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: isUpdating ? 'wait' : 'pointer',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '0.25rem'
                      }}
                    >
                      <Trash2 size={15} />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Stock Limit Error Message if triggered */}
                  {errMessage && (
                    <div style={{
                      fontSize: '0.78rem',
                      color: '#dc2626',
                      backgroundColor: '#fef2f2',
                      padding: '0.35rem 0.6rem',
                      borderRadius: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <AlertCircle size={13} />
                      <span>{errMessage}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Order Summary Section */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: '5rem'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                <span>Total Items</span>
                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{cartCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formatINR(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                <span>Estimated Shipping</span>
                <span style={{ fontWeight: '600', color: '#16a34a' }}>FREE</span>
              </div>
            </div>

            <div style={{
              borderTop: '2px dashed #e2e8f0',
              paddingTop: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>Total</span>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                {formatINR(subtotal)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: '700'
              }}
            >
              <span>Proceed to Checkout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
