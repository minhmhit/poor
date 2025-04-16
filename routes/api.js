const express = require('express');
const router = express.Router();
const productModel = require('../models/products');
const { Cart, saveCartToOrder } = require('../models/cart');
const orderModel = require('../models/orders');

// API thêm vào giỏ hàng
router.post('/cart/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await productModel.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sản phẩm không tồn tại' 
      });
    }
    
    // Khởi tạo giỏ hàng từ session hoặc tạo mới
    let cart = req.session.cart ? new Cart(req.session.cart) : new Cart({});
    
    // Thêm sản phẩm vào giỏ hàng
    cart.add(product, productId, parseInt(quantity) || 1);
    
    // Lưu giỏ hàng vào session
    req.session.cart = cart;
    
    res.json({ 
      success: true, 
      totalQty: cart.totalQty,
      totalPrice: cart.totalPrice 
    });
  } catch (error) {
    console.error('Lỗi khi thêm vào giỏ hàng:', error);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
  }
});

// API cập nhật số lượng sản phẩm trong giỏ hàng
router.post('/cart/update', (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!req.session.cart) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }
    
    const cart = new Cart(req.session.cart);
    
    if (quantity <= 0) {
      cart.removeItem(productId);
    } else {
      cart.updateQty(productId, parseInt(quantity));
    }
    
    req.session.cart = cart;
    
    res.json({ 
      success: true, 
      totalQty: cart.totalQty,
      totalPrice: cart.totalPrice,
      cartItems: cart.generateArray()
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật giỏ hàng:', error);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
  }
});

// API xóa sản phẩm khỏi giỏ hàng
router.post('/cart/remove', (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!req.session.cart || !req.session.cart.items[productId]) {
      return res.status(400).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });
    }
    
    const cart = new Cart(req.session.cart);
    cart.removeItem(productId);
    
    req.session.cart = cart;
    
    res.json({ 
      success: true, 
      totalQty: cart.totalQty,
      totalPrice: cart.totalPrice
    });
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
  }
});

// API đặt hàng
router.post('/order', async (req, res) => {
  try {
    const { name, email, address, phone, note, payment } = req.body;
    
    if (!req.session.cart || req.session.cart.totalQty === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }
    
    if (!name || !email || !address || !phone) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin giao hàng' });
    }
    
    // Lưu thông tin đơn hàng vào database
    const cart = new Cart(req.session.cart);
    const userId = req.session.user ? req.session.user.id : null;
    
    const orderInfo = {
      name,
      email,
      address,
      phone,
      note,
      payment
    };
    
    const orderId = await saveCartToOrder(cart, userId, orderInfo);
    
    // Xóa giỏ hàng khỏi session sau khi đặt hàng thành công
    cart.clear();
    req.session.cart = cart;
    
    res.json({ success: true, orderId });
  } catch (error) {
    console.error('Lỗi khi đặt hàng:', error);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi đặt hàng' });
  }
});

// API lấy thông tin giỏ hàng
router.get('/cart', (req, res) => {
  if (!req.session.cart) {
    return res.json({ 
      success: true,
      items: [],
      totalQty: 0,
      totalPrice: 0
    });
  }
  
  const cart = new Cart(req.session.cart);
  res.json({
    success: true,
    items: cart.generateArray(),
    totalQty: cart.totalQty,
    totalPrice: cart.totalPrice
  });
});

// API lấy thông tin đơn hàng
router.get('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.session.user ? req.session.user.id : null;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để xem đơn hàng' });
    }
    
    const order = await orderModel.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    
    // Đảm bảo chỉ có thể xem đơn hàng của chính mình (trừ khi là admin)
    if (order.user_id !== userId && !req.session.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn hàng này' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin đơn hàng:', error);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
  }
});

// API lấy danh sách đơn hàng của người dùng
router.get('/orders', async (req, res) => {
  try {
    const userId = req.session.user ? req.session.user.id : null;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để xem đơn hàng' });
    }
    
    const orders = await orderModel.getOrdersByUserId(userId);
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
  }
});

// API tìm kiếm sản phẩm
router.get('/products/search', async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const products = await productModel.searchProducts(keyword);
    res.json({ success: true, products });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
  }
});

module.exports = router; 