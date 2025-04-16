const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productModel = require('../models/products');
const categoryModel = require('../models/categories');
const orderModel = require('../models/orders');
const adminModel = require('../models/admin');
const { isLoggedIn } = require('./auth');

// Cấu hình multer để lưu trữ file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/products/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file hình ảnh có định dạng: ' + filetypes));
  }
});

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
router.get('/', async (req, res) => {
  try {
    // Lấy thống kê tổng hợp
    const stats = await adminModel.getDashboardStats();
    
    // Lấy 5 đơn hàng gần nhất
    const orders = await orderModel.getAllOrders();
    const recentOrders = orders.slice(0, 5);
    
    res.render('admin/dashboard', { 
      title: 'Trang quản trị',
      stats,
      recentOrders
    });
  } catch (error) {
    console.error('Lỗi khi tải trang quản trị:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải trang quản trị' 
    });
  }
});

// ============== QUẢN LÝ SẢN PHẨM ==============
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
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải danh sách sản phẩm' 
    });
  }
});

// Quản lý sản phẩm - thêm mới
router.get('/products/add', async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.render('admin/product-form', { 
      title: 'Thêm sản phẩm mới',
      product: {},
      categories
    });
  } catch (error) {
    console.error('Lỗi khi tải form thêm sản phẩm:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải form thêm sản phẩm' 
    });
  }
});

// Quản lý sản phẩm - xử lý thêm mới
router.post('/products/add', upload.single('image'), async (req, res) => {
  try {
    const productData = req.body;
    
    // Chuyển đổi category_id, price và stock sang số
    productData.category_id = parseInt(productData.category_id) || null;
    productData.price = parseFloat(productData.price) || 0;
    productData.stock = parseInt(productData.stock) || 0;
    
    // Xử lý hình ảnh
    if (req.file) {
      productData.image_url = '/images/products/' + req.file.filename;
    } else {
      productData.image_url = '/images/default-product.jpg';
    }
    
    await productModel.addProduct(productData);
    req.flash('success', 'Thêm sản phẩm thành công');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm:', error);
    res.status(500).render('error', { 
      title: 'Lỗi thêm sản phẩm',
      message: 'Không thể thêm sản phẩm mới. Vui lòng kiểm tra lại thông tin.'
    });
  }
});

// Quản lý sản phẩm - chỉnh sửa
router.get('/products/edit/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.getProductById(productId);
    
    if (!product) {
      return res.status(404).render('error', { 
        title: 'Không tìm thấy',
        message: 'Sản phẩm không tồn tại' 
      });
    }
    
    const categories = await categoryModel.getAllCategories();
    
    res.render('admin/product-form', { 
      title: 'Chỉnh sửa sản phẩm',
      product,
      categories
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin sản phẩm:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải thông tin sản phẩm' 
    });
  }
});

// Quản lý sản phẩm - xử lý chỉnh sửa
router.post('/products/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;
    
    // Chuyển đổi category_id, price và stock sang số
    productData.category_id = parseInt(productData.category_id) || null;
    productData.price = parseFloat(productData.price) || 0;
    productData.stock = parseInt(productData.stock) || 0;
    
    // Xử lý hình ảnh
    if (req.file) {
      productData.image_url = '/images/products/' + req.file.filename;
    } else {
      // Giữ nguyên image_url cũ nếu không có
      const existingProduct = await productModel.getProductById(productId);
      productData.image_url = existingProduct.image_url;
    }
    
    await productModel.updateProduct(productId, productData);
    req.flash('success', 'Cập nhật sản phẩm thành công');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    res.status(500).render('error', { 
      title: 'Lỗi cập nhật',
      message: 'Không thể cập nhật sản phẩm. Vui lòng kiểm tra lại thông tin.'
    });
  }
});

// Quản lý sản phẩm - xóa
router.get('/products/delete/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    await productModel.deleteProduct(productId);
    req.flash('success', 'Xóa sản phẩm thành công');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    res.status(500).render('error', { 
      title: 'Lỗi xóa sản phẩm',
      message: 'Không thể xóa sản phẩm' 
    });
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
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải danh sách danh mục' 
    });
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
    res.status(500).render('error', { 
      title: 'Lỗi thêm danh mục',
      message: 'Không thể thêm danh mục mới' 
    });
  }
});

// Quản lý danh mục - chỉnh sửa
router.get('/categories/edit/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryModel.getCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).render('error', { 
        title: 'Không tìm thấy',
        message: 'Danh mục không tồn tại' 
      });
    }
    
    res.render('admin/category-form', { 
      title: 'Chỉnh sửa danh mục',
      category 
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin danh mục:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải thông tin danh mục' 
    });
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
    res.status(500).render('error', { 
      title: 'Lỗi cập nhật',
      message: 'Không thể cập nhật danh mục' 
    });
  }
});

// Quản lý danh mục - xóa
router.get('/categories/delete/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const productCount = await categoryModel.countProductsInCategory(categoryId);
    
    if (productCount > 0) {
      return res.status(400).render('error', { 
        title: 'Không thể xóa',
        message: 'Không thể xóa danh mục này vì vẫn có sản phẩm thuộc danh mục này',
        back: '/admin/categories'
      });
    }
    
    await categoryModel.deleteCategory(categoryId);
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Lỗi khi xóa danh mục:', error);
    res.status(500).render('error', { 
      title: 'Lỗi xóa danh mục',
      message: 'Không thể xóa danh mục' 
    });
  }
});

// ============== QUẢN LÝ ĐƠN HÀNG ==============
// Quản lý đơn hàng - danh sách
router.get('/orders', async (req, res) => {
  try {
    const orders = await orderModel.getAllOrders();
    res.render('admin/orders', { 
      title: 'Quản lý đơn hàng',
      orders
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải danh sách đơn hàng' 
    });
  }
});

// Quản lý đơn hàng - chi tiết
router.get('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderModel.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).render('error', { 
        title: 'Không tìm thấy',
        message: 'Đơn hàng không tồn tại' 
      });
    }
    
    const statusHistory = await orderModel.getOrderStatusHistory(orderId);
    
    res.render('admin/order-detail', { 
      title: `Chi tiết đơn hàng #${orderId}`,
      order,
      statusHistory
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải chi tiết đơn hàng' 
    });
  }
});

// Quản lý đơn hàng - cập nhật trạng thái
router.post('/orders/:id/update-status', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, note } = req.body;
    
    await orderModel.updateOrderStatus(orderId, status, note);
    
    req.flash('success', 'Đã cập nhật trạng thái đơn hàng thành công');
    res.redirect(`/admin/orders/${orderId}`);
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    res.status(500).render('error', { 
      title: 'Lỗi cập nhật',
      message: 'Không thể cập nhật trạng thái đơn hàng' 
    });
  }
});

// ============== QUẢN LÝ NGƯỜI DÙNG ==============
// Quản lý người dùng - danh sách
router.get('/users', async (req, res) => {
  try {
    const users = await adminModel.getAllUsers();
    res.render('admin/users', { 
      title: 'Quản lý người dùng',
      users
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải danh sách người dùng' 
    });
  }
});

// Quản lý người dùng - chi tiết
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await adminModel.getUserById(userId);
    
    if (!user) {
      return res.status(404).render('error', { 
        title: 'Không tìm thấy',
        message: 'Người dùng không tồn tại' 
      });
    }
    
    res.render('admin/user-detail', { 
      title: `Thông tin người dùng: ${user.name}`,
      user
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải thông tin người dùng' 
    });
  }
});

// Quản lý người dùng - cập nhật quyền
router.post('/users/:id/update-role', async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    
    await adminModel.updateUserRole(userId, role);
    
    req.flash('success', 'Đã cập nhật quyền người dùng thành công');
    res.redirect(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Lỗi khi cập nhật quyền người dùng:', error);
    res.status(500).render('error', { 
      title: 'Lỗi cập nhật',
      message: 'Không thể cập nhật quyền người dùng' 
    });
  }
});

module.exports = router; 