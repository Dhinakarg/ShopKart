import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { getProducts, seedProducts, getWishlist } from '../services/api';
import { PackageSearch, AlertCircle, RefreshCw } from 'lucide-react';

const Products = ({ user, addToCart, onWishlistChange }) => {
  const navigate = useNavigate();

  // Redirect unauthenticated users immediately to /login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');

  const fetchProductsAndWishlist = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getProducts({ search, category, sort });
      let currentProducts = data.products || [];

      // Auto-seed sample products if catalog is initially empty and no filters applied
      if (data.count === 0 && !search && !category && !sort) {
        await seedProducts();
        const seededData = await getProducts({});
        currentProducts = seededData.products || [];
      }
      setProducts(currentProducts);

      // Fetch user's wishlist IDs to highlight saved items
      try {
        const wishlistData = await getWishlist();
        if (wishlistData.wishlist) {
          const ids = wishlistData.wishlist.map((item) => item._id);
          setWishlistIds(ids);
        }
      } catch (wErr) {
        console.error('Error fetching wishlist IDs:', wErr);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      fetchProductsAndWishlist();
    }, 300); // 300ms debounce for search text

    return () => clearTimeout(timer);
  }, [search, category, sort, user]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
  };

  const handleWishlistToggle = (_id, newSavedState) => {
    if (newSavedState) {
      setWishlistIds((prev) => [...prev, _id]);
    } else {
      setWishlistIds((prev) => prev.filter((id) => id !== _id));
    }
    if (onWishlistChange) {
      onWishlistChange();
    }
  };

  if (!user) return null;

  return (
    <div className="page-container" style={{ alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Search, Filter & Sort Controls */}
        <SearchBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
        />

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Loading product catalog...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{
            maxWidth: '500px',
            margin: '2rem auto',
            padding: '2rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Unable to load products
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {error}
            </p>
            <button onClick={fetchProductsAndWishlist} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.5rem'
          }}>
            <PackageSearch size={40} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              No products found
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Try adjusting your search criteria or category filter.
            </p>
            <button onClick={handleResetFilters} className="btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
              Reset Filters
            </button>
          </div>
        )}

        {/* Dynamic Product Cards Grid */}
        {!loading && !error && products.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                addToCart={addToCart}
                isWishlisted={wishlistIds.includes(product._id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
