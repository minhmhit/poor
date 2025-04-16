const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const userModel = require('../models/users');

// Middleware để kiểm tra đã đăng nhập hay chưa
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/auth/login');
  }
};

// Middleware để kiểm tra chưa đăng nhập
const isNotLoggedIn = (req, res, next) => {
  if (!req.session || !req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
};

// Trang đăng nhập
router.get('/login', isNotLoggedIn, (req, res) => {
  res.render('auth/login', { 
    title: 'Đăng nhập',
    error: req.flash('error')[0],
    success: req.flash('success')[0]
  });
});

// Xử lý đăng nhập
router.post('/login', isNotLoggedIn, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
      return res.redirect('/auth/login');
    }
    
    const result = await userModel.login(email, password);
    
    if (!result.success) {
      req.flash('error', result.message);
      return res.redirect('/auth/login');
    }
    
    // Lưu thông tin người dùng vào session
    req.session.user = result.user;
    
    // Lấy thông tin khách hàng nếu có
    const customerInfo = await userModel.getCustomerByUserId(result.user.id);
    if (customerInfo) {
      req.session.user.customerInfo = customerInfo;
    }
    
    // Kiểm tra giỏ hàng trong session
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    // Chuyển hướng đến trang chủ
    res.redirect('/');
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    req.flash('error', 'Đã xảy ra lỗi khi đăng nhập, vui lòng thử lại sau');
    res.redirect('/auth/login');
  }
});

// Trang đăng ký
router.get('/register', isNotLoggedIn, (req, res) => {
  res.render('auth/register', { 
    title: 'Đăng ký', 
    error: req.flash('error')[0]
  });
});

// Xử lý đăng ký
router.post('/register', isNotLoggedIn, async (req, res) => {
  try {
    const { name, email, password, confirm_password, terms } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password || !confirm_password) {
      req.flash('error', 'Vui lòng nhập đầy đủ thông tin cần thiết');
      return res.redirect('/auth/register');
    }
    
    // Kiểm tra xác nhận mật khẩu
    if (password !== confirm_password) {
      req.flash('error', 'Xác nhận mật khẩu không khớp');
      return res.redirect('/auth/register');
    }
    
    // Kiểm tra email đã tồn tại chưa
    const emailExists = await userModel.checkEmailExists(email);
    if (emailExists) {
      req.flash('error', 'Email đã được sử dụng, vui lòng chọn email khác');
      return res.redirect('/auth/register');
    }
    
    // Tạo người dùng mới
    await userModel.register({
      name,
      email,
      password,
      phone: req.body.phone || null,
      address: req.body.address || null
    });
    
    req.flash('success', 'Đăng ký thành công, vui lòng đăng nhập');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    req.flash('error', 'Đã xảy ra lỗi khi đăng ký, vui lòng thử lại sau');
    res.redirect('/auth/register');
  }
});

// Đăng xuất
router.get('/logout', isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Lỗi khi đăng xuất:', err);
    }
    res.redirect('/');
  });
});

// API kiểm tra trạng thái đăng nhập
router.get('/check-auth', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ 
      isLoggedIn: true, 
      user: {
        id: req.session.user.id,
        name: req.session.user.name,
        email: req.session.user.email,
        role: req.session.user.role
      }
    });
  } else {
    res.json({ isLoggedIn: false });
  }
});

module.exports = {
  router,
  isLoggedIn,
  isNotLoggedIn
}; 