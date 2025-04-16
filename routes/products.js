const express = require('express');
const router = express.Router();
const productModel = require('../models/products');

// Danh sách tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.render('products', { 
      title: 'Tất cả sản phẩm',
      products,
      categoryName: 'Tất cả sản phẩm'
    });
  } catch (error) {
    console.error('Lỗi khi truy vấn sản phẩm:', error);
    res.status(500).render('error', { message: 'Không thể tải sản phẩm' });
  }
});

// Danh sách sản phẩm theo danh mục
router.get('/category/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const products = await productModel.getProductsByCategory(categoryId);
    
    // Lấy tên danh mục từ sản phẩm đầu tiên (nếu có)
    const categoryName = products.length > 0 
      ? products[0].category_name 
      : 'Danh mục không tồn tại';
    
    res.render('products', { 
      title: categoryName,
      products,
      categoryName
    });
  } catch (error) {
    console.error('Lỗi khi truy vấn sản phẩm theo danh mục:', error);
    res.status(500).render('error', { message: 'Không thể tải sản phẩm' });
  }
});

// Chi tiết sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.getProductById(productId);
    
    if (!product) {
      return res.status(404).render('error', { message: 'Sản phẩm không tồn tại' });
    }
    
    res.render('product-detail', { 
      title: product.name,
      product
    });
  } catch (error) {
    console.error('Lỗi khi truy vấn chi tiết sản phẩm:', error);
    res.status(500).render('error', { message: 'Không thể tải thông tin sản phẩm' });
  }
});

module.exports = router; 