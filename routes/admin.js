const express = require('express');
const router = express.Router();
const productModel = require('../models/products');

// Phần middleware kiểm tra đăng nhập admin (chưa có thực tế)
const isAdmin = (req, res, next) => {
  // Kiểm tra logic xác thực admin ở đây
  // Tạm thời cho phép truy cập
  next();
};

// Áp dụng middleware cho tất cả các route admin
router.use(isAdmin);

// Trang quản trị chính
router.get('/', (req, res) => {
  res.render('admin/dashboard', { title: 'Trang quản trị' });
});

// Quản lý sản phẩm - danh sách
router.get('/products', async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.render('admin/products', { 
      title: 'Quản lý sản phẩm',
      products 
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    res.status(500).render('error', { message: 'Không thể tải danh sách sản phẩm' });
  }
});

// Quản lý sản phẩm - thêm mới
router.get('/products/add', async (req, res) => {
  res.render('admin/product-form', { 
    title: 'Thêm sản phẩm mới',
    product: {} 
  });
});

// Quản lý sản phẩm - xử lý thêm mới
router.post('/products/add', async (req, res) => {
  try {
    const productData = req.body;
    await productModel.addProduct(productData);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm:', error);
    res.status(500).render('error', { message: 'Không thể thêm sản phẩm mới' });
  }
});

// Quản lý sản phẩm - chỉnh sửa
router.get('/products/edit/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.getProductById(productId);
    
    if (!product) {
      return res.status(404).render('error', { message: 'Sản phẩm không tồn tại' });
    }
    
    res.render('admin/product-form', { 
      title: 'Chỉnh sửa sản phẩm',
      product 
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin sản phẩm:', error);
    res.status(500).render('error', { message: 'Không thể tải thông tin sản phẩm' });
  }
});

// Quản lý sản phẩm - xử lý chỉnh sửa
router.post('/products/edit/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;
    
    await productModel.updateProduct(productId, productData);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    res.status(500).render('error', { message: 'Không thể cập nhật sản phẩm' });
  }
});

// Quản lý sản phẩm - xóa
router.get('/products/delete/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    await productModel.deleteProduct(productId);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    res.status(500).render('error', { message: 'Không thể xóa sản phẩm' });
  }
});

module.exports = router; 