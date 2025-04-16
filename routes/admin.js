const express = require('express');
const router = express.Router();
const productModel = require('../models/products');
const categoryModel = require('../models/categories');
const { isLoggedIn } = require('./auth');

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    // Nếu là admin, cho phép truy cập
    next();
  } else {
    // Không phải admin, chuyển hướng về trang đăng nhập
    req.flash('error', 'Bạn không có quyền truy cập trang quản trị');
    res.redirect('/auth/login');
  }
};

// Áp dụng middleware cho tất cả các route admin
router.use(isLoggedIn);
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

// ============== QUẢN LÝ DANH MỤC ==============
// Quản lý danh mục - danh sách
router.get('/categories', async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    
    // Lấy thêm số lượng sản phẩm trong mỗi danh mục
    for (let category of categories) {
      category.productCount = await categoryModel.countProductsInCategory(category.category_id);
    }
    
    res.render('admin/categories', { 
      title: 'Quản lý danh mục',
      categories 
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách danh mục:', error);
    res.status(500).render('error', { message: 'Không thể tải danh sách danh mục' });
  }
});

// Quản lý danh mục - thêm mới
router.get('/categories/add', async (req, res) => {
  res.render('admin/category-form', { 
    title: 'Thêm danh mục mới',
    category: {} 
  });
});

// Quản lý danh mục - xử lý thêm mới
router.post('/categories/add', async (req, res) => {
  try {
    const categoryData = req.body;
    await categoryModel.addCategory(categoryData);
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Lỗi khi thêm danh mục:', error);
    res.status(500).render('error', { message: 'Không thể thêm danh mục mới' });
  }
});

// Quản lý danh mục - chỉnh sửa
router.get('/categories/edit/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryModel.getCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).render('error', { message: 'Danh mục không tồn tại' });
    }
    
    res.render('admin/category-form', { 
      title: 'Chỉnh sửa danh mục',
      category 
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin danh mục:', error);
    res.status(500).render('error', { message: 'Không thể tải thông tin danh mục' });
  }
});

// Quản lý danh mục - xử lý chỉnh sửa
router.post('/categories/edit/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryData = req.body;
    
    await categoryModel.updateCategory(categoryId, categoryData);
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Lỗi khi cập nhật danh mục:', error);
    res.status(500).render('error', { message: 'Không thể cập nhật danh mục' });
  }
});

// Quản lý danh mục - xóa
router.get('/categories/delete/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const productCount = await categoryModel.countProductsInCategory(categoryId);
    
    if (productCount > 0) {
      return res.status(400).render('error', { 
        message: 'Không thể xóa danh mục này vì vẫn có sản phẩm thuộc danh mục này',
        back: '/admin/categories'
      });
    }
    
    await categoryModel.deleteCategory(categoryId);
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Lỗi khi xóa danh mục:', error);
    res.status(500).render('error', { message: 'Không thể xóa danh mục' });
  }
});

module.exports = router; 