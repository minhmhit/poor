const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productModel = require('../models/products');
const categoryModel = require('../models/categories');
const orderModel = require('../models/orders');
const adminModel = require('../models/admin');
const supplierModel = require('../models/suppliers');
const stockModel = require('../models/stock');
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
// ============== QUẢN LÝ ĐĂNG NHẬP ==============
// kiểm tra không phải quyền customer
const isNotCustomer = (req, res, next) => {
  if (req.session.user && req.session.user.role !== 'customer') {
    next();
  } else {
    req.flash('error', 'Bạn không có quyền truy cập trang quản trị');
    res.redirect('/auth/login');
  }
};

// Tạo middleware riêng để kiểm tra đăng nhập cho admin
const isAdminAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    // Đã đăng nhập, kiểm tra xem có phải customer không
    if (req.session.user.role !== 'customer') {
      return next();
    } else {
      req.flash('error', 'Bạn không có quyền truy cập trang quản trị');
      return res.redirect('/');
    }
  }
  // Chưa đăng nhập
  return res.redirect('/admin/login');
};

// Áp dụng middleware cho tất cả các route admin trừ route login
router.use((req, res, next) => {
  if (req.path === '/login' || req.path === '/logout') {
    return next();
  }
  isAdminAuthenticated(req, res, next);
});

// Kiểm tra người dùng có quyền admin HOẶC manager
const isAdminOrManager = (req, res, next) => {
  if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'manager')) {
    next();
  } else {
    req.flash('error', 'Bạn không có quyền truy cập trang này');
    res.redirect('/admin/login');
  }
};
// Kiểm tra người dùng có quyền admin HOẶC sale
const isAdminOrSale = (req, res, next) => {
  if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sale')) {
    next();
  } else {
    req.flash('error', 'Bạn không có quyền truy cập trang này');
    res.redirect('/admin/login');
  }
};  

// Kiểm tra người dùng có quyền admin HOẶC warehouse
const isAdminOrWarehouse = (req, res, next) => {
  if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'warehouse')) {
    next();
  } else {
    req.flash('error', 'Bạn không có quyền truy cập trang này');
    res.redirect('/admin/login');
  }
}; 
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
// chỉ cho phép manager và admin truy cập
// Áp dụng cho tất cả các tuyến đường bắt đầu bằng '/products'
  router.use('/products', isAdminOrWarehouse);
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
// chỉ cho phép warehouse và admin truy cập
// Áp dụng cho tất cả các tuyến đường bắt đầu bằng '/categories'
router.use('/categories', isAdminOrWarehouse);
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
// chỉ cho phép sale và admin truy cập
// Áp dụng cho tất cả các tuyến đường bắt đầu bằng '/orders'
router.use('/orders', isAdminOrSale);
router.get('/orders', async (req, res) => {
  try {
    // Lấy các tham số lọc từ query string
    const filters = {
      status: req.query.status || '',
      q: req.query.q || '',
      date: req.query.date || ''
    };
    
    // Lấy danh sách đơn hàng theo bộ lọc
    const orders = await orderModel.getFilteredOrders(filters);
    
    res.render('admin/orders', { 
      title: 'Quản lý đơn hàng',
      orders,
      filters // Truyền lại các bộ lọc để hiển thị giá trị đã chọn
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
// chỉ cho phép manager và admin truy cập
// Áp dụng cho tất cả các tuyến đường bắt đầu bằng '/users'
router.use('/users', isAdminOrManager);
router.get('/users', async (req, res) => {
  try {
    // Lấy các tham số lọc từ query string
    const filters = {
      role: req.query.role || '',
      q: req.query.q || '',
      date: req.query.date || '',
      status: req.query.status || ''
    };
    
    // Lấy danh sách người dùng theo bộ lọc
    const users = await adminModel.getFilteredUsers(filters);
    
    res.render('admin/users', { 
      title: 'Quản lý người dùng',
      users,
      filters, // Truyền lại các bộ lọc để hiển thị giá trị đã chọn
      messages: req.flash()
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải danh sách người dùng' 
    });
  }
});

// Quản lý người dùng - thêm mới
router.get('/users/add', async (req, res) => {
  try {
    res.render('admin/user-form', { 
      title: 'Thêm người dùng mới',
      user: {},
      error: null
    });
  } catch (error) {
    console.error('Lỗi khi tạo form thêm người dùng:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tạo form thêm người dùng' 
    });
  }
});

// Quản lý người dùng - xử lý thêm mới
router.post('/users/add', async (req, res) => {
  try {
    const userData = req.body;
    
    // Kiểm tra mật khẩu xác nhận
    if (userData.password !== userData.password_confirm) {
      return res.status(400).render('admin/user-form', {
        title: 'Thêm người dùng mới',
        user: userData,
        error: 'Mật khẩu xác nhận không khớp'
      });
    }
    
    // Kiểm tra email đã tồn tại
    const existingUser = await adminModel.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).render('admin/user-form', {
        title: 'Thêm người dùng mới',
        user: userData,
        error: 'Email đã được sử dụng'
      });
    }
    
    // Tạo người dùng mới
    const userId = await adminModel.createUser(userData);
    
    // Cập nhật quyền chi tiết nếu có
    if (userData.permissions) {
      const permissions = Array.isArray(userData.permissions) ? userData.permissions : [userData.permissions];
      await adminModel.updateUserPermissions(userId, permissions);
    }
    
    req.flash('success', 'Đã thêm người dùng mới thành công');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Lỗi khi thêm người dùng:', error);
    res.status(500).render('error', { 
      title: 'Lỗi thêm người dùng',
      message: 'Không thể thêm người dùng mới' 
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

// Quản lý người dùng - cập nhật trạng thái
router.post('/users/:id/update-status', async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    
    await adminModel.updateUserStatus(userId, status);
    
    req.flash('success', 'Đã cập nhật trạng thái tài khoản thành công');
    res.redirect(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái tài khoản:', error);
    res.status(500).render('error', { 
      title: 'Lỗi cập nhật',
      message: 'Không thể cập nhật trạng thái tài khoản' 
    });
  }
});

// Quản lý người dùng - chỉnh sửa
router.get('/users/:id/edit', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await adminModel.getUserById(userId);
    
    if (!user) {
      return res.status(404).render('error', { 
        title: 'Không tìm thấy',
        message: 'Người dùng không tồn tại' 
      });
    }
    
    res.render('admin/user-form', { 
      title: `Chỉnh sửa thông tin người dùng: ${user.name}`,
      user,
      error: null
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng để chỉnh sửa:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải thông tin người dùng để chỉnh sửa' 
    });
  }
});

// Quản lý người dùng - xử lý sửa thông tin
router.post('/users/:id/edit', async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    
    // Cập nhật thông tin cơ bản
    await adminModel.updateUserInfo(userId, userData);
    
    // Cập nhật vai trò nếu có
    if (userData.role) {
      await adminModel.updateUserRole(userId, userData.role);
    }
    
    // Cập nhật trạng thái nếu có
    if (userData.status) {
      await adminModel.updateUserStatus(userId, userData.status);
    }
    
    // Cập nhật quyền chi tiết nếu có
    if (userData.permissions) {
      // Nếu permissions được gửi là một giá trị đơn (không phải mảng), 
      // thì chuyển thành mảng có một phần tử
      const permissions = Array.isArray(userData.permissions) ? userData.permissions : [userData.permissions];
      await adminModel.updateUserPermissions(userId, permissions);
    } else {
      // Nếu không có quyền nào được chọn, gán mảng rỗng
      await adminModel.updateUserPermissions(userId, []);
    }
    
    req.flash('success', 'Đã cập nhật thông tin người dùng thành công');
    res.redirect(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    res.status(500).render('error', { 
      title: 'Lỗi cập nhật',
      message: 'Không thể cập nhật thông tin người dùng' 
    });
  }
});

// Quản lý người dùng - xóa
router.get('/users/:id/delete', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Không cho phép xóa tài khoản đang đăng nhập
    if (req.session.user && req.session.user.id == userId) {
      req.flash('error', 'Không thể xóa tài khoản đang đăng nhập');
      return res.redirect('/admin/users');
    }
    
    await adminModel.deleteUser(userId);
    
    req.flash('success', 'Đã xóa người dùng thành công');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    res.status(500).render('error', { 
      title: 'Lỗi xóa người dùng',
      message: 'Không thể xóa người dùng' 
    });
  }
});

// ============== QUẢN LÝ HÓA ĐƠN ==============
// In hóa đơn bán hàng
// chỉ cho phép sale và admin truy cập
// Áp dụng cho tất cả các tuyến đường bắt đầu bằng '/orders'
// router.use('/orders', isAdminOrSale);
router.get('/orders/:id/print', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderModel.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).render('error', { 
        title: 'Không tìm thấy',
        message: 'Đơn hàng không tồn tại' 
      });
    }
    
    // Tạo phiên bản hóa đơn để in
    const invoiceData = {
      order_id: orderId,
      content: JSON.stringify(order),
      created_at: new Date(),
      created_by: req.session.user.id
    };
    
    // Lưu hóa đơn vào bảng invoices
    await adminModel.saveInvoice(invoiceData);
    
    // Render trang in hóa đơn
    res.render('admin/invoice-print', {
      title: `In hóa đơn #${orderId}`,
      order,
      currentUser: req.session.user
    });
  } catch (error) {
    console.error('Lỗi khi tạo hóa đơn:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tạo hóa đơn' 
    });
  }
});

// Danh sách hóa đơn đã lưu
router.get('/invoices', isAdminOrSale, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Xử lý lọc theo ngày
    let startDate = req.query.start_date ? new Date(req.query.start_date) : null;
    let endDate = req.query.end_date ? new Date(req.query.end_date) : null;
    
    // Nếu chỉ có start_date, thì lấy đến hiện tại
    if (startDate && !endDate) {
      endDate = new Date();
    }
    
    // Nếu chỉ có end_date, thì lấy từ 30 ngày trước đó
    if (!startDate && endDate) {
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 30);
    }
    
    // Nếu không có cả hai, lấy 30 ngày gần nhất
    if (!startDate && !endDate) {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }
    
    const invoices = await adminModel.getInvoices(startDate, endDate, page, limit);
    const total = await adminModel.countInvoices(startDate, endDate);
    
    res.render('admin/invoices', {
      title: 'Danh sách hóa đơn',
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        start_date: startDate,
        end_date: endDate
      },
      messages: req.flash()
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hóa đơn:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể lấy danh sách hóa đơn' 
    });
  }
});

// Xem chi tiết hóa đơn
router.get('/invoices/:id', isAdminOrSale, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await adminModel.getInvoiceById(invoiceId);
    
    if (!invoice) {
      return res.status(404).render('error', { 
        title: 'Không tìm thấy',
        message: 'Hóa đơn không tồn tại' 
      });
    }
    
    // Parse nội dung từ JSON sang object
    let orderData = {};
    try {
      orderData = JSON.parse(invoice.content);
    } catch (e) {
      console.error('Lỗi khi parse dữ liệu hóa đơn:', e);
    }
    
    res.render('admin/invoice-detail', {
      title: `Chi tiết hóa đơn #${invoiceId}`,
      invoice,
      order: orderData
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể lấy chi tiết hóa đơn' 
    });
  }
});

// ============== BÁO CÁO THỐNG KÊ ==============
// Thống kê doanh thu

router.get('/reports/sales',isAdminOrSale, async (req, res) => {
  try {
    // Xử lý tham số thời gian
    const period = req.query.period || 'month'; // day, week, month, year
    
    let startDate = req.query.start_date ? new Date(req.query.start_date) : null;
    let endDate = req.query.end_date ? new Date(req.query.end_date) : null;
    
    if (!startDate || !endDate) {
      const today = new Date();
      
      if (period === 'day') {
        // Thống kê trong ngày hiện tại
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      } else if (period === 'week') {
        // Thống kê 7 ngày gần nhất
        startDate = new Date();
        startDate.setDate(today.getDate() - 7);
        endDate = today;
      } else if (period === 'month') {
        // Thống kê tháng hiện tại
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
      } else if (period === 'year') {
        // Thống kê năm hiện tại
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
      }
    }
    
    // Lấy dữ liệu thống kê
    const salesStats = await adminModel.getSalesStats(startDate, endDate, period);
    const topProducts = await adminModel.getTopSellingProducts(startDate, endDate, 10);
    const topCustomers = await adminModel.getTopCustomers(startDate, endDate, 10);
    
    res.render('admin/sales-report', {
      title: 'Báo cáo doanh thu',
      period,
      startDate,
      endDate,
      salesStats,
      topProducts,
      topCustomers
    });
  } catch (error) {
    console.error('Lỗi khi tạo báo cáo doanh thu:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tạo báo cáo doanh thu' 
    });
  }
});

// Xuất báo cáo doanh thu
router.get('/reports/sales/export', async (req, res) => {
  try {
    // Xử lý tham số thời gian giống như ở route xem báo cáo
    const period = req.query.period || 'month';
    
    let startDate = req.query.start_date ? new Date(req.query.start_date) : null;
    let endDate = req.query.end_date ? new Date(req.query.end_date) : null;
    
    if (!startDate || !endDate) {
      const today = new Date();
      
      if (period === 'day') {
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      } else if (period === 'week') {
        startDate = new Date();
        startDate.setDate(today.getDate() - 7);
        endDate = today;
      } else if (period === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
      } else if (period === 'year') {
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
      }
    }
    
    // Lấy dữ liệu thống kê
    const salesStats = await adminModel.getSalesStats(startDate, endDate, period);
    const topProducts = await adminModel.getTopSellingProducts(startDate, endDate, 10);
    
    // Tên file xuất ra
    const fileName = `sales-report-${period}-${startDate.toISOString().slice(0, 10)}-to-${endDate.toISOString().slice(0, 10)}.csv`;
    
    // Thiết lập header cho CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Tạo nội dung CSV
    let csvContent = 'Ngày,Số đơn hàng,Doanh thu,Lợi nhuận\n';
    
    // Thêm dữ liệu thống kê theo ngày vào CSV
    salesStats.byDate.forEach(stat => {
      csvContent += `${stat.date},${stat.orderCount},${stat.revenue},${stat.profit}\n`;
    });
    
    // Thêm dòng trống và tiêu đề cho phần sản phẩm bán chạy
    csvContent += '\nSản phẩm bán chạy\nTên sản phẩm,Số lượng bán,Doanh thu\n';
    
    // Thêm dữ liệu sản phẩm bán chạy vào CSV
    topProducts.forEach(product => {
      csvContent += `${product.name},${product.quantity},${product.revenue}\n`;
    });
    
    // Gửi nội dung CSV
    res.send(csvContent);
  } catch (error) {
    console.error('Lỗi khi xuất báo cáo doanh thu:', error);
    res.status(500).json({ error: 'Không thể xuất báo cáo doanh thu' });
  }
});

// ============== QUẢN LÝ NHÀ CUNG CẤP ==============
// Danh sách nhà cung cấp
// chỉ cho phép warehouse và admin truy cập
// Áp dụng cho tất cả các tuyến đường bắt đầu bằng '/suppliers'
router.use('/suppliers', isAdminOrWarehouse);
router.get('/suppliers', async (req, res) => {
  try {
    // Lấy các tham số lọc từ query string
    const filters = {
      status: req.query.status || '',
      q: req.query.q || ''
    };
    
    // Lấy danh sách nhà cung cấp theo bộ lọc
    const suppliers = await supplierModel.getFilteredSuppliers(filters);
    
    res.render('admin/suppliers', { 
      title: 'Quản lý nhà cung cấp',
      suppliers,
      filters,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhà cung cấp:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải danh sách nhà cung cấp' 
    });
  }
});

// Form thêm nhà cung cấp
router.get('/suppliers/add', async (req, res) => {
  try {
    res.render('admin/supplier-form', { 
      title: 'Thêm nhà cung cấp mới',
      supplier: {},
      mode: 'add'
    });
  } catch (error) {
    console.error('Lỗi khi tạo form thêm nhà cung cấp:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tạo form thêm nhà cung cấp' 
    });
  }
});

// Xử lý thêm nhà cung cấp
router.post('/suppliers/add', async (req, res) => {
  try {
    const supplierData = req.body;
    
    const supplierId = await supplierModel.addSupplier(supplierData);
    
    req.flash('success', 'Đã thêm nhà cung cấp mới thành công');
    res.redirect('/admin/suppliers');
  } catch (error) {
    console.error('Lỗi khi thêm nhà cung cấp:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể thêm nhà cung cấp mới' 
    });
  }
});

// Form chỉnh sửa nhà cung cấp
router.get('/suppliers/edit/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplier = await supplierModel.getSupplierById(supplierId);
    
    if (!supplier) {
      return res.status(404).render('error', { 
        title: 'Không tìm thấy',
        message: 'Nhà cung cấp không tồn tại' 
      });
    }
    
    res.render('admin/supplier-form', { 
      title: 'Chỉnh sửa nhà cung cấp',
      supplier,
      mode: 'edit'
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin nhà cung cấp:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải thông tin nhà cung cấp' 
    });
  }
});

// Xử lý chỉnh sửa nhà cung cấp
router.post('/suppliers/edit/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplierData = req.body;
    
    await supplierModel.updateSupplier(supplierId, supplierData);
    
    req.flash('success', 'Đã cập nhật thông tin nhà cung cấp thành công');
    res.redirect('/admin/suppliers');
  } catch (error) {
    console.error('Lỗi khi cập nhật nhà cung cấp:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể cập nhật thông tin nhà cung cấp' 
    });
  }
});

// Xử lý xóa nhà cung cấp
router.get('/suppliers/delete/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    
    await supplierModel.deleteSupplier(supplierId);
    
    req.flash('success', 'Đã xóa nhà cung cấp thành công');
    res.redirect('/admin/suppliers');
  } catch (error) {
    console.error('Lỗi khi xóa nhà cung cấp:', error);
    req.flash('error', error.message || 'Không thể xóa nhà cung cấp');
    res.redirect('/admin/suppliers');
  }
});

// Xem chi tiết nhà cung cấp
router.get('/suppliers/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplier = await supplierModel.getSupplierById(supplierId);
    
    if (!supplier) {
      return res.status(404).render('error', { 
        title: 'Không tìm thấy',
        message: 'Nhà cung cấp không tồn tại' 
      });
    }
    
    // Lấy phiếu nhập theo nhà cung cấp
    const imports = await stockModel.getFilteredStockImports({ supplier_id: supplierId });
    
    res.render('admin/supplier-detail', { 
      title: `Chi tiết nhà cung cấp: ${supplier.name}`,
      supplier,
      imports
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết nhà cung cấp:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải chi tiết nhà cung cấp' 
    });
  }
});

// ============== QUẢN LÝ NHẬP KHO ==============
// Danh sách phiếu nhập kho
// chỉ cho phép warehouse và admin truy cập
// Áp dụng cho tất cả các tuyến đường bắt đầu bằng '/stock'
router.use('/stock', isAdminOrWarehouse);
router.get('/stock/imports', async (req, res) => {
  try {
    // Lấy các tham số lọc từ query string
    const filters = {
      supplier_id: req.query.supplier_id || '',
      payment_status: req.query.payment_status || '',
      from_date: req.query.from_date || '',
      to_date: req.query.to_date || '',
      import_code: req.query.import_code || '',
      month: req.query.month || '',
      year: req.query.year || ''
    };
    
    // Lấy danh sách nhà cung cấp cho dropdown
    const suppliers = await supplierModel.getAllSuppliers();
    
    // Lấy danh sách phiếu nhập theo bộ lọc
    const imports = await stockModel.getFilteredStockImports(filters);
    
    res.render('admin/stock-imports', { 
      title: 'Quản lý nhập kho',
      imports,
      suppliers,
      filters,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phiếu nhập kho:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải danh sách phiếu nhập kho' 
    });
  }
});

// Form tạo phiếu nhập kho mới
router.get('/stock/imports/add', async (req, res) => {
  try {
    // Lấy danh sách nhà cung cấp
    const suppliers = await supplierModel.getAllSuppliers();
    
    // Lấy danh sách sản phẩm
    const products = await productModel.getAllProducts();
    
    // Tạo mã phiếu nhập mới
    const importCode = await stockModel.generateImportCode();
    
    res.render('admin/stock-import-form', { 
      title: 'Tạo phiếu nhập kho mới',
      stockImport: {
        import_code: importCode,
        import_date: new Date().toISOString().split('T')[0] // Ngày hiện tại
      },
      suppliers,
      products,
      mode: 'add',
      messages: req.flash() || {}
    });
  } catch (error) {
    console.error('Lỗi khi tạo form nhập kho:', error);
    req.flash('error', 'Không thể tạo form nhập kho: ' + error.message);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tạo form nhập kho',
      messages: req.flash() || {}
    });
  }
});

// Xử lý tạo phiếu nhập kho mới
router.post('/stock/imports/add', async (req, res) => {
  try {
    console.log('Dữ liệu form:', req.body);

    const importData = {
      supplier_id: req.body.supplier_id,
      import_date: req.body.import_date,
      import_code: req.body.import_code,
      total_amount: req.body.total_amount || 0,
      payment_status: req.body.payment_status || 'pending',
      note: req.body.notes,
      created_by: req.session.user ? req.session.user.id : 1
    };
    
    // Xử lý dữ liệu sản phẩm từ form
    const products = req.body.products || [];
    const items = [];
    
    // Kiểm tra cấu trúc dữ liệu sản phẩm và xử lý phù hợp
    if (Array.isArray(products)) {
      // Nếu products là mảng (định dạng mới)
      products.forEach(product => {
        if (product && product.product_id && parseInt(product.quantity) > 0) {
          items.push({
            product_id: product.product_id,
            quantity: parseInt(product.quantity),
            import_price: parseFloat(product.import_price),
            total_price: parseInt(product.quantity) * parseFloat(product.import_price)
          });
        }
      });
    } else if (typeof products === 'object' && products !== null) {
      // Xử lý cấu trúc khi products là object (định dạng index[product_id])
      Object.keys(products).forEach(key => {
        const product = products[key];
        if (product && product.product_id && parseInt(product.quantity) > 0) {
          items.push({
            product_id: product.product_id,
            quantity: parseInt(product.quantity),
            import_price: parseFloat(product.import_price),
            total_price: parseInt(product.quantity) * parseFloat(product.import_price)
          });
        }
      });
    } else {
      // Xử lý kiểu cũ (product_id, quantity nằm trực tiếp trong req.body)
      const productIds = Array.isArray(req.body.product_id) ? req.body.product_id : [req.body.product_id];
      const quantities = Array.isArray(req.body.quantity) ? req.body.quantity : [req.body.quantity];
      const prices = Array.isArray(req.body.import_price) ? req.body.import_price : [req.body.import_price];
      
      if (productIds && productIds.length > 0) {
        productIds.forEach((productId, index) => {
          if (productId && quantities[index] && parseInt(quantities[index]) > 0) {
            items.push({
              product_id: productId,
              quantity: parseInt(quantities[index]),
              import_price: parseFloat(prices[index]),
              total_price: parseInt(quantities[index]) * parseFloat(prices[index])
            });
          }
        });
      }
    }
    
    console.log('Các sản phẩm được xử lý:', items);
    
    // Tính tổng tiền từ các mục
    const totalAmount = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    importData.total_amount = totalAmount;
    
    if (items.length === 0) {
      req.flash('error', 'Phiếu nhập kho phải có ít nhất một sản phẩm');
      return res.redirect('/admin/stock/imports/add');
    }
    
    const importId = await stockModel.createStockImport(importData, items);
    
    req.flash('success', 'Đã tạo phiếu nhập kho thành công');
    res.redirect(`/admin/stock/imports/${importId}`);
  } catch (error) {
    console.error('Lỗi khi tạo phiếu nhập kho:', error);
    req.flash('error', error.message || 'Không thể tạo phiếu nhập kho');
    res.redirect('/admin/stock/imports/add');
  }
});

// Xem chi tiết phiếu nhập kho
router.get('/stock/imports/:id', async (req, res) => {
  try {
    const importId = req.params.id;
    const stockImport = await stockModel.getStockImportById(importId);
    
    if (!stockImport) {
      req.flash('error', 'Phiếu nhập kho không tồn tại');
      return res.redirect('/admin/stock/imports');
    }
    
    // Lấy chi tiết các sản phẩm trong phiếu nhập
    const importItems = await stockModel.getStockImportItems(importId);
    
    res.render('admin/stock-import-detail', { 
      title: `Chi tiết phiếu nhập kho #${stockImport.import_code}`,
      stockImport,
      importItems,
      messages: req.flash() || {}
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết phiếu nhập kho:', error);
    req.flash('error', 'Không thể tải chi tiết phiếu nhập kho');
    res.redirect('/admin/stock/imports');
  }
});

// In phiếu nhập kho
router.get('/stock/imports/:id/print', async (req, res) => {
  try {
    const importId = req.params.id;
    const stockImport = await stockModel.getStockImportById(importId);
    
    if (!stockImport) {
      return res.status(404).render('error', { 
        title: 'Không tìm thấy',
        message: 'Phiếu nhập kho không tồn tại' 
      });
    }
    
    res.render('admin/stock-import-print', { 
      title: `In phiếu nhập kho #${stockImport.import_code}`,
      stockImport,
      currentUser: req.session.user
    });
  } catch (error) {
    console.error('Lỗi khi in phiếu nhập kho:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể in phiếu nhập kho' 
    });
  }
});

// Form cập nhật phiếu nhập kho
router.get('/stock/imports/:id/edit', async (req, res) => {
  try {
    const importId = req.params.id;
    const stockImport = await stockModel.getStockImportById(importId);
    
    if (!stockImport) {
      return res.status(404).render('error', { 
        title: 'Không tìm thấy',
        message: 'Phiếu nhập kho không tồn tại' 
      });
    }
    
    // Chỉ cho phép cập nhật thông tin chung, không cập nhật sản phẩm
    const suppliers = await supplierModel.getAllSuppliers();
    
    res.render('admin/stock-import-edit', { 
      title: `Cập nhật phiếu nhập kho #${stockImport.import_code}`,
      stockImport,
      suppliers
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin phiếu nhập kho:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải thông tin phiếu nhập kho' 
    });
  }
});

// Xử lý cập nhật phiếu nhập kho
router.post('/stock/imports/:id/edit', async (req, res) => {
  try {
    const importId = req.params.id;
    const importData = {
      supplier_id: req.body.supplier_id,
      import_date: req.body.import_date,
      payment_status: req.body.payment_status,
      note: req.body.note
    };
    
    await stockModel.updateStockImport(importId, importData);
    
    req.flash('success', 'Đã cập nhật phiếu nhập kho thành công');
    res.redirect(`/admin/stock/imports/${importId}`);
  } catch (error) {
    console.error('Lỗi khi cập nhật phiếu nhập kho:', error);
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể cập nhật phiếu nhập kho' 
    });
  }
});

// Xóa phiếu nhập kho
router.get('/stock/imports/:id/delete', async (req, res) => {
  try {
    const importId = req.params.id;
    
    await stockModel.deleteStockImport(importId);
    
    req.flash('success', 'Đã xóa phiếu nhập kho thành công');
    res.redirect('/admin/stock/imports');
  } catch (error) {
    console.error('Lỗi khi xóa phiếu nhập kho:', error);
    req.flash('error', error.message || 'Không thể xóa phiếu nhập kho');
    res.redirect('/admin/stock/imports');
  }
});

// Xem lịch sử nhập kho
router.get('/stock/history', async (req, res) => {
  try {
    // Lấy các tham số lọc từ query string
    const filters = {
      product_id: req.query.product_id || '',
      source_type: req.query.source_type || '',
      from_date: req.query.from_date || '',
      to_date: req.query.to_date || ''
    };
    
    let stockHistory = [];
    
    // Nếu có từ ngày và đến ngày, lấy lịch sử theo khoảng thời gian
    if (filters.from_date && filters.to_date) {
      stockHistory = await stockModel.getStockHistoryByDate(
        filters.from_date, 
        filters.to_date, 
        filters.source_type
      );
    } 
    // Nếu có product_id, lấy lịch sử theo sản phẩm
    else if (filters.product_id) {
      stockHistory = await stockModel.getStockHistoryByProduct(filters.product_id);
    }
    // Nếu không có điều kiện lọc, lấy tất cả (có giới hạn)
    else {
      stockHistory = await stockModel.getRecentStockHistory(100);
    }
    
    // Lấy danh sách sản phẩm cho dropdown
    const products = await productModel.getAllProducts();
    
    res.render('admin/stock-history', { 
      title: 'Lịch sử nhập xuất kho',
      stockHistory,
      products,
      filters,
      messages: req.flash() || {}
    });
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử nhập kho:', error);
    req.flash('error', 'Không thể tải lịch sử nhập kho');
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải lịch sử nhập kho',
      messages: req.flash() || {}
    });
  }
});

// Thống kê nhập kho
router.get('/stock/stats', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || '';
    
    // Lấy thống kê nhập kho theo năm, tháng
    const stats = await stockModel.getStockImportStatsByPeriod(year, month);
    
    // Lấy danh sách năm để lọc
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    
    res.render('admin/stock-stats', { 
      title: 'Thống kê nhập kho',
      stats,
      filters: {
        year,
        month
      },
      years,
      messages: req.flash() || {}
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê nhập kho:', error);
    req.flash('error', 'Không thể tải thống kê nhập kho');
    res.status(500).render('error', { 
      title: 'Lỗi hệ thống',
      message: 'Không thể tải thống kê nhập kho',
      messages: req.flash() || {}
    });
  }
});

module.exports = router; 