const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 3000;

// Kiểm tra kết nối database
const { testConnection } = require('./models/db');
testConnection();

// Import các routes
const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/products');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');

// Thiết lập middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Thiết lập session
app.use(session({
  secret: 'coffee_shop_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Middleware để thêm user và cart vào res.locals
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.cart = req.session.cart || { items: [], totalQty: 0, totalPrice: 0 };
  next();
});

// Thiết lập view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Thiết lập routes
app.use('/', indexRoutes);
app.use('/products', productRoutes);
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/admin', adminRoutes);
app.use('/search', searchRoutes);

// Xử lý route product/:id (chuyển hướng đến /products/:id)
app.get('/product/:id', (req, res) => {
  res.redirect(`/products/${req.params.id}`);
});

// Xử lý route login (chuyển hướng đến /auth/login)
app.get('/login', (req, res) => {
  res.redirect('/auth/login');
});

// Xử lý route checkout (chuyển hướng đến /cart/checkout)
app.get('/checkout', (req, res) => {
  res.redirect('/cart/checkout');
});

// Xử lý route không tồn tại - 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Không tìm thấy trang',
    message: 'Trang bạn đang tìm kiếm không tồn tại'
  });
});

// Xử lý lỗi - 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Đã xảy ra lỗi',
    message: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
}); 