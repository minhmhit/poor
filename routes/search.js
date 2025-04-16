const express = require('express');
const router = express.Router();
const productModel = require('../models/products');

// Trang kết quả tìm kiếm
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const products = await productModel.searchProducts(keyword);
    
    res.render('search-results', {
      title: `Kết quả tìm kiếm: ${keyword}`,
      products,
      keyword
    });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error);
    res.status(500).render('error', { message: 'Có lỗi xảy ra khi tìm kiếm' });
  }
});

module.exports = router; 