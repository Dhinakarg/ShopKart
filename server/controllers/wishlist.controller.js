import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

/**
 * @desc    Add a product to current user's wishlist
 * @route   POST /wishlist/:productId
 * @access  Private (Authenticated)
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

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

    // Fetch user instance
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!Array.isArray(customer.wishlist)) {
      customer.wishlist = [];
    }

    // Check if product is already in wishlist (Duplicate prevention)
    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id && id.toString() === productId.toString()
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add Product ObjectId to wishlist array
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error adding product to wishlist',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user's populated wishlist
 * @route   GET /wishlist
 * @access  Private (Authenticated)
 */
export const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name description price category image stock createdAt'
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const wishlistItems = Array.isArray(customer.wishlist) ? customer.wishlist : [];
    // Clean up any deleted product references that populated as null
    const validWishlistItems = wishlistItems.filter((item) => item !== null && item !== undefined);

    return res.status(200).json({
      success: true,
      count: validWishlistItems.length,
      wishlist: validWishlistItems
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching wishlist',
      error: error.message
    });
  }
};

/**
 * @desc    Remove a product from current user's wishlist
 * @route   DELETE /wishlist/:productId
 * @access  Private (Authenticated)
 */
export const removeFromWishlist = async (req, res) => {
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

    if (!Array.isArray(customer.wishlist)) {
      customer.wishlist = [];
    }

    // Check if product is in wishlist
    const exists = customer.wishlist.some(
      (id) => id && id.toString() === productId.toString()
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }

    // Remove product reference
    customer.wishlist = customer.wishlist.filter(
      (id) => id && id.toString() !== productId.toString()
    );
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error removing product from wishlist',
      error: error.message
    });
  }
};

/**
 * @desc    Toggle product in wishlist (Bonus Task 23)
 * @route   PATCH /wishlist/:productId/toggle
 * @access  Private (Authenticated)
 */
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Product ID format'
      });
    }

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

    if (!Array.isArray(customer.wishlist)) {
      customer.wishlist = [];
    }

    const existsIndex = customer.wishlist.findIndex(
      (id) => id && id.toString() === productId.toString()
    );

    let saved = false;
    if (existsIndex > -1) {
      // Remove
      customer.wishlist.splice(existsIndex, 1);
      saved = false;
    } else {
      // Add
      customer.wishlist.push(productId);
      saved = true;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      saved,
      message: saved ? 'Product added to wishlist' : 'Product removed from wishlist'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error toggling wishlist',
      error: error.message
    });
  }
};
