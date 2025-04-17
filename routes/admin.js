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
router.get('/invoices', async (req, res) => {
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
router.get('/invoices/:id', async (req, res) => {
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
router.get('/reports/sales', async (req, res) => {
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

module.exports = router; 