import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartModal = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, clearCart }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Check if any cart item exceeds available stock
  const hasStockError = cart.some((item) => item.quantity > item.stock);

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(totalAmount);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
        cursor: 'pointer'
      }}
    >
      {/* Slide-over Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
          animation: 'slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'default'
        }}
      >
        {/* Cart Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
              Shopping Cart
            </h2>
            <span style={{
              backgroundColor: '#e0e7ff',
              color: 'var(--primary-color)',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px'
            }}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {cart.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              textAlign: 'center'
            }}>
              <ShoppingBag size={48} style={{ strokeWidth: 1.5, marginBottom: '0.75rem', color: '#cbd5e1' }} />
              <p style={{ fontSize: '1rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '240px' }}>
                Explore our catalog and add your favorite items to shop!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => {
                const isExceedingStock = item.quantity > item.stock;
                const itemTotal = item.price * item.quantity;
                const formattedItemPrice = new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0
                }).format(itemTotal);

                return (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      gap: '0.85rem',
                      padding: '0.85rem',
                      backgroundColor: isExceedingStock ? '#fef2f2' : '#ffffff',
                      border: isExceedingStock ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      alignItems: 'center'
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '0.375rem',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #f1f5f9'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="10">Image</text></svg>';
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'var(--text-main)',
                        margin: '0 0 0.2rem 0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.name}
                      </h4>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                        {formattedItemPrice}
                      </div>

                      {/* Stock Warning Badge */}
                      {isExceedingStock && (
                        <div style={{
                          color: '#dc2626',
                          fontSize: '0.725rem',
                          fontWeight: '600',
                          marginTop: '0.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <AlertTriangle size={12} />
                          Exceeds stock ({item.stock} available)
                        </div>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: isExceedingStock ? '1px solid #f87171' : '1px solid #cbd5e1',
                      borderRadius: '0.375rem',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff'
                    }}>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        style={{
                          background: '#f8fafc',
                          border: 'none',
                          padding: '0.3rem 0.45rem',
                          cursor: 'pointer',
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{
                        padding: '0 0.5rem',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        minWidth: '24px',
                        textAlign: 'center',
                        color: isExceedingStock ? '#dc2626' : 'inherit'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        style={{
                          background: '#f8fafc',
                          border: 'none',
                          padding: '0.3rem 0.45rem',
                          cursor: 'pointer',
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.35rem',
                        marginLeft: '0.2rem'
                      }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Totals */}
        {cart.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            {/* Stock Exceeded Error Banner */}
            {hasStockError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '0.65rem 0.85rem',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>Cannot checkout: Some items exceed available stock.</span>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#475569' }}>
                Subtotal
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {formattedTotal}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={clearCart}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '0.65rem' }}
              >
                Clear Cart
              </button>

              <button
                onClick={() => {
                  if (hasStockError) return;
                  alert('Order checkout completed successfully!');
                  clearCart();
                  onClose();
                }}
                disabled={hasStockError}
                className="btn-primary"
                style={{
                  flex: 2,
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  padding: '0.65rem',
                  opacity: hasStockError ? 0.5 : 1,
                  cursor: hasStockError ? 'not-allowed' : 'pointer',
                  backgroundColor: hasStockError ? '#94a3b8' : undefined
                }}
              >
                Checkout <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
