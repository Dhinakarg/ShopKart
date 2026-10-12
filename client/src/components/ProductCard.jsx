import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, PackageCheck, PackageX, ShoppingCart, Heart, Plus, Minus } from 'lucide-react';
import { toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, isWishlisted: initialWishlisted = false, onWishlistToggle }) => {
  const { _id, name, price, category, image, stock } = product;

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [cardError, setCardError] = useState('');

  const { addToCart, updateQuantity, removeFromCart, actionLoadingId, cartItems } = useCart();
  const isActionLoading = actionLoadingId === _id;

  const existingInCart = cartItems.find((item) => item.product?._id === _id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isActionLoading || stock <= 0) return;
    setCardError('');

    try {
      await addToCart(product, 1);
    } catch (err) {
      setCardError(err.message || 'Failed to add item to cart.');
      setTimeout(() => setCardError(''), 3000);
    }
  };

  const handleIncreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!existingInCart || isActionLoading) return;
    if (existingInCart.quantity >= stock) {
      setCardError(`Stock limit (${stock}) reached`);
      setTimeout(() => setCardError(''), 2500);
      return;
    }
    setCardError('');
    try {
      await updateQuantity(_id, existingInCart.quantity + 1);
    } catch (err) {
      setCardError(err.message || 'Failed to update quantity');
      setTimeout(() => setCardError(''), 2500);
    }
  };

  const handleDecreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!existingInCart || isActionLoading) return;
    setCardError('');
    try {
      if (existingInCart.quantity > 1) {
        await updateQuantity(_id, existingInCart.quantity - 1);
      } else {
        await removeFromCart(_id);
      }
    } catch (err) {
      setCardError(err.message || 'Failed to update quantity');
      setTimeout(() => setCardError(''), 2500);
    }
  };

  // Format currency
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (savingWishlist) return;
    setSavingWishlist(true);

    try {
      const res = await toggleWishlist(_id);
      const newSavedState = res.saved !== undefined ? res.saved : !isWishlisted;
      setIsWishlisted(newSavedState);
      if (onWishlistToggle) {
        onWishlistToggle(_id, newSavedState);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      alert('Unable to update wishlist. Please try again.');
    } finally {
      setSavingWishlist(false);
    }
  };

  return (
    <div className="product-card" style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'border-color 0.15s ease, transform 0.15s ease'
    }}>
      {/* Product Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '65%', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
        <img
          src={image}
          alt={name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="16">Product Image</text></svg>';
          }}
        />

        {/* Wishlist Floating Button */}
        <button
          onClick={handleWishlistClick}
          disabled={savingWishlist}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          style={{
            position: 'absolute',
            top: '0.6rem',
            right: '0.6rem',
            width: '34px',
            height: '34px',
            background: isWishlisted ? '#fef2f2' : '#ffffff',
            border: isWishlisted ? '1px solid #fca5a5' : '1px solid #e2e8f0',
            borderRadius: '50%',
            cursor: savingWishlist ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.15s ease',
            opacity: savingWishlist ? 0.7 : 1
          }}
        >
          <Heart
            size={18}
            style={{
              color: isWishlisted ? '#ef4444' : '#64748b',
              fill: isWishlisted ? '#ef4444' : 'none',
              transition: 'fill 0.15s ease, color 0.15s ease'
            }}
          />
        </button>
      </div>

      {/* Details Content Below Image */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category Tag Badge inside content div */}
        <div style={{ marginBottom: '0.4rem' }}>
          <span style={{
            background: '#e0e7ff',
            color: 'var(--primary-color)',
            border: '1px solid #c7d2fe',
            padding: '0.15rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <Tag size={12} />
            {category}
          </span>
        </div>

        <h3 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: 'var(--text-main)',
          marginBottom: '0.35rem',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {name}
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--primary-color)' }}>
            {formattedPrice}
          </span>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: '500',
            color: stock > 0 ? '#16a34a' : '#dc2626',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            {stock > 0 ? (
              <>
                <PackageCheck size={14} />
                {stock} in stock
              </>
            ) : (
              <>
                <PackageX size={14} />
                Out of Stock
              </>
            )}
          </span>
        </div>

        {cardError && (
          <div style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: '0.5rem', fontWeight: '500' }}>
            {cardError}
          </div>
        )}

        {/* Card Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <Link
            to={`/products/${_id}`}
            className="btn-secondary"
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '0.45rem',
              fontSize: '0.8rem'
            }}
          >
            <span>Details</span>
          </Link>

          {existingInCart ? (
            <div style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              border: '1px solid #4f46e5',
              borderRadius: '0.375rem',
              padding: '0.2rem 0.4rem'
            }}>
              <button
                onClick={handleDecreaseQty}
                disabled={isActionLoading}
                title={existingInCart.quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.25rem',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isActionLoading ? 'wait' : 'pointer',
                  color: '#334155'
                }}
              >
                <Minus size={13} />
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                {isActionLoading ? '...' : existingInCart.quantity}
              </span>
              <button
                onClick={handleIncreaseQty}
                disabled={isActionLoading || existingInCart.quantity >= stock}
                title={existingInCart.quantity >= stock ? "Stock limit reached" : "Increase quantity"}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.25rem',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (isActionLoading || existingInCart.quantity >= stock) ? 'not-allowed' : 'pointer',
                  color: '#334155',
                  opacity: existingInCart.quantity >= stock ? 0.5 : 1
                }}
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={stock === 0 || isActionLoading}
              className="btn-primary"
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '0.45rem',
                fontSize: '0.8rem'
              }}
            >
              <ShoppingCart size={14} />
              <span>
                {isActionLoading ? 'Adding...' : 'Add to Cart'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
