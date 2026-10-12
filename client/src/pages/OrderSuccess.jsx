import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Package, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { getOrderByIdApi } from '../services/api';

const OrderSuccess = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getOrderByIdApi(id);
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError('Order details not found.');
        }
      } catch (err) {
        console.error('Error loading order success page:', err);
        setError('Unable to load order confirmation details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id, user, navigate]);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container">
        <div style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem'
        }}>
          <AlertCircle size={44} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Order Confirmation Error
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error || 'Unable to display order details.'}
          </p>
          <Link to="/orders" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} />
            <span>View My Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#f0fdf4',
          border: '2px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          <CheckCircle2 size={40} style={{ color: '#16a34a' }} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          Order Placed Successfully! 🎉
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Your order has been saved successfully and is ready for fulfillment.
        </p>

        {/* Order Details Card */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.375rem',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
            <span style={{ fontWeight: '700', fontFamily: 'monospace', color: 'var(--text-main)' }}>{order._id}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
            <span style={{ fontWeight: '800', color: 'var(--primary-color)' }}>{formatINR(order.totalAmount)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
            <span style={{
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              fontWeight: '700',
              fontSize: '0.78rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #bbf7d0'
            }}>
              ✓ {order.paymentStatus}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order Status:</span>
            <span style={{
              backgroundColor: '#e0e7ff',
              color: 'var(--primary-color)',
              fontWeight: '700',
              fontSize: '0.78rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #c7d2fe'
            }}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/orders"
            className="btn-primary"
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '0.7rem 1.25rem',
              fontSize: '0.9rem',
              minWidth: '160px'
            }}
          >
            <Package size={16} />
            <span>View My Orders</span>
          </Link>

          <Link
            to="/products"
            className="btn-secondary"
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '0.7rem 1.25rem',
              fontSize: '0.9rem',
              minWidth: '160px'
            }}
          >
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
