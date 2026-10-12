import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, getWishlist, toggleWishlist } from '../services/api';
import { ArrowLeft, ShoppingCart, Tag, PackageCheck, PackageX, AlertCircle, ShieldCheck, Heart, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetails = ({ user, onWishlistChange }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, removeFromCart, actionLoadingId, cartItems } = useCart();
  const isActionLoading = actionLoadingId === id;
  const existingInCart = cartItems.find((item) => item.product?._id === id);

  // Redirect unauthenticated users immediately to /login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedNotice, setAddedNotice] = useState(false);
  const [cartErrorMsg, setCartErrorMsg] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProductById(id);
        if (data.product) {
          setProduct(data.product);
        } else {
          setError('Product details not found.');
        }

        // Check if item is in wishlist
        const wishlistData = await getWishlist();
        if (wishlistData.wishlist) {
          const exists = wishlistData.wishlist.some(item => item._id === id);
          setIsWishlisted(exists);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        const message = err.response?.data?.message || 'Failed to load product details.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!product || isActionLoading || product.stock <= 0) return;
    setCartErrorMsg('');
    try {
      await addToCart(product, 1);
      setAddedNotice(true);
      setTimeout(() => {
        setAddedNotice(false);
      }, 2500);
    } catch (err) {
      setCartErrorMsg(err.message || 'Failed to add product to cart.');
    }
  };

  const handleIncreaseQty = async () => {
    if (!product || !existingInCart || isActionLoading) return;
    if (existingInCart.quantity >= product.stock) {
      setCartErrorMsg(`Stock limit (${product.stock}) reached.`);
      setTimeout(() => setCartErrorMsg(''), 2500);
      return;
    }
    setCartErrorMsg('');
    try {
      await updateQuantity(product._id, existingInCart.quantity + 1);
    } catch (err) {
      setCartErrorMsg(err.message || 'Failed to update quantity.');
    }
  };

  const handleDecreaseQty = async () => {
    if (!product || !existingInCart || isActionLoading) return;
    setCartErrorMsg('');
    try {
      if (existingInCart.quantity > 1) {
        await updateQuantity(product._id, existingInCart.quantity - 1);
      } else {
        await removeFromCart(product._id);
      }
    } catch (err) {
      setCartErrorMsg(err.message || 'Failed to update quantity.');
    }
  };

  const handleWishlistToggle = async () => {
    if (savingWishlist || !id) return;
    setSavingWishlist(true);
    try {
      const res = await toggleWishlist(id);
      const newSaved = res.saved !== undefined ? res.saved : !isWishlisted;
      setIsWishlisted(newSaved);
      if (onWishlistChange) {
        onWishlistChange();
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      alert('Unable to update wishlist. Please try again.');
    } finally {
      setSavingWishlist(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem' }} />
          <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container">
        <div style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem'
        }}>
          <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Product Unavailable
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error || 'The product you are looking for does not exist or has been removed.'}
          </p>
          <Link to="/products" className="btn-primary" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={16} />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <div className="page-container" style={{ alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: '960px' }}>
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
          <span>Back to Products</span>
        </Link>

        {/* Product Details Container */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          {/* Large Image Column */}
          <div style={{ background: '#f8fafc', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '360px',
                objectFit: 'contain',
                borderRadius: '0.375rem'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="16">Product Image</text></svg>';
              }}
            />
          </div>

          {/* Details Specifications Column */}
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Category & Stock Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#e0e7ff',
                  color: 'var(--primary-color)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '0.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <Tag size={13} />
                  {product.category}
                </span>

                <span style={{
                  background: product.stock > 0 ? '#f0fdf4' : '#fef2f2',
                  color: product.stock > 0 ? '#16a34a' : '#dc2626',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '0.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  {product.stock > 0 ? (
                    <>
                      <PackageCheck size={14} />
                      {product.stock} units in stock
                    </>
                  ) : (
                    <>
                      <PackageX size={14} />
                      Out of Stock
                    </>
                  )}
                </span>
              </div>

              {/* Title & Price */}
              <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                {product.name}
              </h1>

              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '1.25rem' }}>
                {formattedPrice}
              </div>

              {/* Description */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Description
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                  {product.description}
                </p>
              </div>
            </div>

            {/* Action Section */}
            <div>
              {cartErrorMsg && (
                <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#dc2626', backgroundColor: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.35rem' }} />
                  <span>{cartErrorMsg}</span>
                </div>
              )}

              {addedNotice && (
                <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} />
                  <span>Item added to your shopping cart!</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {existingInCart ? (
                  <div style={{
                    flex: 2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc',
                    border: '2px solid #4f46e5',
                    borderRadius: '0.375rem',
                    padding: '0.5rem 1rem'
                  }}>
                    <button
                      onClick={handleDecreaseQty}
                      disabled={isActionLoading}
                      title={existingInCart.quantity === 1 ? "Remove item from cart" : "Decrease quantity"}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.25rem',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isActionLoading ? 'wait' : 'pointer',
                        color: '#334155'
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                        {isActionLoading ? '...' : `${existingInCart.quantity} in Cart`}
                      </span>
                    </div>
                    <button
                      onClick={handleIncreaseQty}
                      disabled={isActionLoading || existingInCart.quantity >= product.stock}
                      title={existingInCart.quantity >= product.stock ? "Stock limit reached" : "Increase quantity"}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.25rem',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (isActionLoading || existingInCart.quantity >= product.stock) ? 'not-allowed' : 'pointer',
                        color: '#334155',
                        opacity: existingInCart.quantity >= product.stock ? 0.5 : 1
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isActionLoading}
                    className="btn-primary"
                    style={{
                      flex: 2,
                      justifyContent: 'center',
                      padding: '0.75rem',
                      fontSize: '1rem'
                    }}
                  >
                    <ShoppingCart size={18} />
                    <span>{isActionLoading ? 'Adding to Cart...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                )}

                <button
                  onClick={handleWishlistToggle}
                  disabled={savingWishlist}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '0.375rem',
                    backgroundColor: isWishlisted ? '#fef2f2' : '#ffffff',
                    border: isWishlisted ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                    color: isWishlisted ? '#dc2626' : '#475569',
                    cursor: savingWishlist ? 'wait' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Heart
                    size={18}
                    style={{
                      color: isWishlisted ? '#ef4444' : '#64748b',
                      fill: isWishlisted ? '#ef4444' : 'none'
                    }}
                  />
                  <span>{savingWishlist ? '⏳ Saving...' : isWishlisted ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

