import Product from '../models/product.model.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new product
 * @route   POST /products
 * @access  Public
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validate mandatory fields
    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, image, stock) are required'
      });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    // Validate numeric price
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a number greater than 0'
      });
    }

    // Validate numeric stock
    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    const product = await Product.create({
      name,
      description,
      price: numericPrice,
      category,
      image,
      stock: numericStock
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error creating product',
      error: error.message
    });
  }
};

/**
 * @desc    Get all products with search, category filter, and price sorting
 * @route   GET /products
 * @access  Public
 */
export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const query = {};

    // Search filter (case-insensitive name match)
    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Category filter
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Build sort option
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    }

    const products = await Product.find(query).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching products',
      error: error.message
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /products/:id
 * @access  Public
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching product details',
      error: error.message
    });
  }
};

/**
 * @desc    Seed initial catalog products
 * @route   GET /products/seed
 * @access  Public
 */
export const seedProducts = async (req, res) => {
  try {
    const sampleProducts = [
      {
        _id: '66d000000000000000000001',
        name: 'Headphones',
        description: 'Wireless over-ear headphones with active noise cancellation and 30-hour battery life.',
        price: 4999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        stock: 25
      },
      {
        _id: '66d000000000000000000002',
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB mechanical keyboard with tactile blue switches and detachable USB-C cable.',
        price: 2999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
        stock: 12
      },
      {
        _id: '66d000000000000000000003',
        name: 'Smart Fitness Watch',
        description: 'AMOLED display smartwatch with heart rate monitoring, GPS, and 5ATM water resistance.',
        price: 3499,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
        stock: 18
      },
      {
        _id: '66d000000000000000000004',
        name: 'Classic Leather Jacket',
        description: 'Premium genuine leather jacket with quilted lining and sleek zip closure.',
        price: 5999,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop&q=80',
        stock: 8
      },
      {
        _id: '66d000000000000000000005',
        name: 'Urban Canvas Sneakers',
        description: 'Lightweight breathable sneakers designed for modern everyday comfort.',
        price: 1999,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop&q=80',
        stock: 30
      },
      {
        _id: '66d000000000000000000006',
        name: 'Minimalist Ceramic Mug Set',
        description: 'Set of 4 matte finish ceramic coffee mugs with heat-insulated handles.',
        price: 899,
        category: 'Home',
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
        stock: 45
      },
      {
        _id: '66d000000000000000000007',
        name: 'Desk Chair',
        description: 'Comfortable modern desk chair for home or office use.',
        price: 7499,
        category: 'Home',
        image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop&q=80',
        stock: 5
      }
    ];

    // Reset collection with simple predictable IDs
    await Product.deleteMany({});
    const created = await Product.insertMany(sampleProducts);

    return res.status(201).json({
      success: true,
      message: 'Catalog seeded successfully with simple predictable IDs',
      count: created.length,
      products: created
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error seeding products',
      error: error.message
    });
  }
};
