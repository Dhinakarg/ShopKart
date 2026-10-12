import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getWishlist, removeFromWishlist } from '../services/api';
import { Heart, ArrowRight, AlertCircle } from 'lucide-react';

const Wishlist = ({ user, addToCart, onWishlistChange }) => {
  const navigate = useNavigate();

  // Redirect unauthenticated users immediately to /login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWishlist();
      setWishlistItems(data.wishlist || []);
      if (onWishlistChange) {
        onWishlistChange(data.wishlist || []);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Unable to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchUserWishlist();
  }, [user]);

  const handleWishlistToggle = async (productId, isSaved) => {
    if (!isSaved) {
      // Product was toggled off (removed from wishlist)
      const updated = wishlistItems.filter((item) => item._id !== productId);
      setWishlistItems(updated);
      if (onWishlistChange) {
        onWishlistChange(updated);
      }
    }
  };

  if (!user) return null;

  // 1. Loading State
  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>
            Loading your wishlist...
          </p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="page-container">
        <div style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem',
          margin: '2rem auto'
        }}>
          <AlertCircle size={44} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Unable to load wishlist
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <button onClick={fetchUserWishlist} className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty Wishlist State
  if (wishlistItems.length === 0) {
    return (
      <div className="page-container">
        <div style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem',
          margin: '2rem auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <Heart size={32} style={{ color: '#ef4444', fill: '#fca5a5' }} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Your wishlist is empty ❤️
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Save products you love and find them here later.
          </p>

          <Link to="/products" className="btn-primary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}>
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // 4. Populated Wishlist Grid (Identical Product Catalog Layout)
  return (
    <div className="page-container" style={{ alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Wishlist Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '1.5rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              My Wishlist
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'product' : 'products'} saved
            </p>
          </div>

          <Link to="/products" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
            Continue Shopping
          </Link>
        </div>

        {/* Dynamic Product Cards Grid (Matching Products Page Layout 100%) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {wishlistItems.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              addToCart={addToCart}
              isWishlisted={true}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
