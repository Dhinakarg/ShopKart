import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Calendar, AlertCircle, RefreshCw, ChevronRight, CheckCircle2, Truck, Clock } from 'lucide-react';
import { getOrdersApi } from '../services/api';

const Orders = ({ user }) => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserOrders = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await getOrdersApi();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      const msg = err.response?.data?.message || 'Unable to load your orders.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserOrders();
  }, [user, navigate]);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      case 'SHIPPED':
        return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
      case 'CONFIRMED':
      case 'PLACED':
        return { bg: '#e0e7ff', color: 'var(--primary-color)', border: '#c7d2fe' };
      default:
        return { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
    }
  };

  if (!user) return null;

  // 1. Loading State
  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && orders.length === 0) {
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
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <AlertCircle size={44} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Unable to load your orders.
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <button
            onClick={fetchUserOrders}
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
  if (orders.length === 0) {
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
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
            <Package size={32} style={{ color: 'var(--primary-color)' }} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            You have not placed any orders yet.
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            When you complete purchases, your order history will appear here.
          </p>
          <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={18} />
            <span>Start Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  // 4. Orders List
  return (
    <div className="page-container" style={{ alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={26} style={{ color: 'var(--primary-color)' }} />
          My Orders ({orders.length})
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => {
            const statusStyle = getStatusColor(order.status);
            return (
              <div
                key={order._id}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {/* Header: Order ID & Date */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                      Order #{order._id}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <Calendar size={13} style={{ color: '#64748b' }} />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <span style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.border}`,
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '0.25rem'
                  }}>
                    {order.status}
                  </span>
                </div>

                {/* Items Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '36px', height: '36px', borderRadius: '0.25rem', objectFit: 'cover', background: '#f8fafc' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="%23f1f5f9"/>'; }}
                          />
                        )}
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                          {item.name} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>× {item.quantity}</span>
                        </span>
                      </div>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer: Total & Details Action */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.75rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                      {formatINR(order.totalAmount)}
                    </div>
                  </div>

                  <Link
                    to={`/order-success/${order._id}`}
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <span>View Details</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
