import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCartApi, updateCartQuantityApi, removeFromCartApi } from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch cart from backend whenever user changes / logs in
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setCartLoading(false);
      return;
    }

    setCartLoading(true);
    setCartError('');
    try {
      const data = await getCart();
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      const msg = err.response?.data?.message || 'Unable to load your cart.';
      setCartError(msg);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Derived values
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
    const targetId = product._id || product.id;
    if (!targetId) return;

    setActionLoadingId(targetId);
    setCartError('');
    try {
      const data = await addToCartApi(targetId, quantity);
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      } else {
        await fetchCart();
      }
      return { success: true };
    } catch (err) {
      console.error('Add to cart error:', err);
      const msg = err.response?.data?.message || 'Failed to add item to cart.';
      setCartError(msg);
      throw new Error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setActionLoadingId(productId);
    setCartError('');
    try {
      const data = await updateCartQuantityApi(productId, newQuantity);
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      } else {
        await fetchCart();
      }
      return { success: true };
    } catch (err) {
      console.error('Update quantity error:', err);
      const msg = err.response?.data?.message || 'Failed to update item quantity.';
      setCartError(msg);
      throw new Error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    setActionLoadingId(productId);
    setCartError('');
    try {
      const data = await removeFromCartApi(productId);
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      } else {
        await fetchCart();
      }
      return { success: true };
    } catch (err) {
      console.error('Remove from cart error:', err);
      const msg = err.response?.data?.message || 'Failed to remove item from cart.';
      setCartError(msg);
      throw new Error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Clear cart helper
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    cartLoading,
    cartError,
    actionLoadingId,
    cartCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart: fetchCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
