const express = require('express');
const router = express.Router();

// Trang đăng nhập
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Đăng nhập' });
});

// Xử lý đăng nhập
router.post('/login', (req, res) => {
  // Xử lý logic đăng nhập
  const { email, password } = req.body;
  
  // TODO: Xác thực thông tin đăng nhập với database
  
  // Chuyển hướng về trang chủ (tạm thời)
  res.redirect('/');
});

// Trang đăng ký
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Đăng ký' });
});

// Xử lý đăng ký
router.post('/register', (req, res) => {
  // Xử lý logic đăng ký
  const { name, email, password } = req.body;
  
  // TODO: Lưu thông tin người dùng mới vào database
  
  // Chuyển hướng đến trang đăng nhập
  res.redirect('/auth/login');
});

// Đăng xuất
router.get('/logout', (req, res) => {
  // Xử lý đăng xuất
  
  // Chuyển hướng về trang chủ
  res.redirect('/');
});

module.exports = router; 