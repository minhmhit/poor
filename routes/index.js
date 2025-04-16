const express = require('express');
const router = express.Router();
const productModel = require('../models/products');

// Trang chủ
router.get('/', async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.render('index', { products });
  } catch (error) {
    console.error('Lỗi khi truy vấn sản phẩm:', error);
    res.status(500).render('error', { message: 'Không thể tải sản phẩm' });
  }
});

// Trang giới thiệu
router.get('/about', (req, res) => {
  res.render('about', { title: 'Về chúng tôi' });
});

// Trang liên hệ
router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Liên hệ' });
});

module.exports = router; 