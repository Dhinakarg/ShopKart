import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';


export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const addQuantity = req.body?.quantity ? Number(req.body.quantity) : 1;

    if (isNaN(addQuantity) || addQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Product ID format'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    // Fetch user instance
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    // Find existing cart item
    const existingIndex = customer.cart.findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    let targetQuantity = addQuantity;
    if (existingIndex > -1) {
      targetQuantity = customer.cart[existingIndex].quantity + addQuantity;
    }

    // Stock validation
    if (targetQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock'
      });
    }

    if (existingIndex > -1) {
      customer.cart[existingIndex].quantity = targetQuantity;
    } else {
      customer.cart.push({
        product: productId,
        quantity: targetQuantity
      });
    }

    await customer.save();

    // Re-fetch populated cart
    const updatedCustomer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name description price category image stock createdAt'
    });

    const validCart = (updatedCustomer.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: validCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error adding product to cart',
      error: error.message
    });
  }
};


export const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name description price category image stock createdAt'
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const cartItems = Array.isArray(customer.cart) ? customer.cart : [];
    // Clean up any deleted product references that populated as null
    const validCartItems = cartItems.filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      count: validCartItems.length,
      cart: validCartItems
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching cart',
      error: error.message
    });
  }
};


export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    const newQuantity = Number(quantity);
    if (quantity === undefined || quantity === null || isNaN(newQuantity) || newQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Product ID format'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    // Check if item exists in user's cart
    const itemIndex = customer.cart.findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    // Validate stock limit
    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock'
      });
    }

    customer.cart[itemIndex].quantity = newQuantity;
    await customer.save();

    // Re-fetch populated cart
    const updatedCustomer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name description price category image stock createdAt'
    });

    const validCart = (updatedCustomer.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: validCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating cart quantity',
      error: error.message
    });
  }
};


export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Product ID format'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    // Check if product is in cart
    const exists = customer.cart.some(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    // Remove item from cart array
    customer.cart = customer.cart.filter(
      (item) => item.product && item.product.toString() !== productId.toString()
    );
    await customer.save();

    // Re-fetch populated cart
    const updatedCustomer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name description price category image stock createdAt'
    });

    const validCart = (updatedCustomer.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: validCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error removing product from cart',
      error: error.message
    });
  }
};
