import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, LogIn, UserPlus, ChevronDown, ShieldCheck, Package, ShoppingCart, Heart } from 'lucide-react';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ user, setUser, wishlistCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { cartCount } = useCart();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setDropdownOpen(false);
      navigate('/login');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-content">
        <Link to={user ? "/products" : "/login"} className="brand-logo">
          <span>ShopKart</span>
        </Link>

        <nav className="nav-links">
          {user ? (
            <React.Fragment>
              {/* 1. Products */}
              <Link
                to="/products"
                className={`nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`}
              >
                <Package size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Products
              </Link>

              {/* 2. Wishlist */}
              <Link
                to="/wishlist"
                className={`nav-link ${location.pathname === '/wishlist' ? 'active' : ''}`}
              >
                <Heart size={16} style={{ display: 'inline', marginRight: '6px', color: '#ef4444' }} />
                Wishlist
                {wishlistCount > 0 && (
                  <span style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    borderRadius: '9999px',
                    padding: '0.1rem 0.45rem',
                    marginLeft: '0.35rem',
                    lineHeight: 1
                  }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* 3. Cart */}
              <Link
                to="/cart"
                className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  position: 'relative'
                }}
              >
                <ShoppingCart size={18} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span style={{
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    borderRadius: '9999px',
                    padding: '0.1rem 0.45rem',
                    marginLeft: '0.2rem',
                    lineHeight: 1
                  }}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* 4. Profile Menu */}
              <div className="user-menu-wrapper" ref={dropdownRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  title={`Profile (${user.fullName})`}
                  style={{
                    padding: '0.4rem 0.65rem',
                    borderRadius: '0.375rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: dropdownOpen ? '#e0e7ff' : 'transparent',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  <User size={18} style={{ color: '#4f46e5' }} />
                  <ChevronDown
                    size={15}
                    style={{
                      color: '#64748b',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header" style={{ paddingLeft: '0.25rem' }}>
                      <div>
                        <div className="dropdown-user-name">{user.fullName}</div>
                        <div className="dropdown-user-email">{user.email}</div>
                      </div>
                    </div>

                    <div className="dropdown-details-list">
                      <Link
                        to="/home"
                        onClick={() => setDropdownOpen(false)}
                        className="dropdown-detail-item"
                        style={{ textDecoration: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
                      >
                        <User size={16} style={{ color: '#4f46e5' }} />
                        <span>View Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="dropdown-detail-item"
                        style={{ textDecoration: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
                      >
                        <Package size={16} style={{ color: '#4f46e5' }} />
                        <span>My Orders</span>
                      </Link>
                      <div className="dropdown-detail-item">
                        <ShieldCheck size={16} style={{ color: '#16a34a' }} />
                        <span style={{ color: '#16a34a', fontWeight: '600' }}>Verified Customer</span>
                      </div>
                    </div>

                    <button onClick={handleLogout} className="btn-danger">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Link
                to="/login"
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                <LogIn size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                <UserPlus size={16} />
                Register
              </Link>
            </React.Fragment>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
