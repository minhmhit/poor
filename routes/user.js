const express = require('express');
const router = express.Router();
const orderModel = require('../models/orders');

// Middleware kiểm tra đăng nhập
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
};

// Trang thông tin tài khoản
router.get('/profile', isAuthenticated, (req, res) => {
  res.render('user/profile', {
    title: 'Thông tin tài khoản',
    user: req.session.user
  });
});

// Trang danh sách đơn hàng
router.get('/orders', isAuthenticated, async (req, res) => {
  try {
    const orders = await orderModel.getOrdersByUserId(req.session.user.id);
    
    res.render('user/orders', {
      title: 'Đơn hàng của tôi',
      orders
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    res.status(500).render('error', {
      title: 'Đã xảy ra lỗi',
      message: 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.'
    });
  }
});

// Trang chi tiết đơn hàng
router.get('/orders/:id', isAuthenticated, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderModel.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).render('error', {
        title: 'Không tìm thấy',
        message: 'Đơn hàng không tồn tại hoặc đã bị xóa.'
      });
    }
    
    // Kiểm tra xem đơn hàng có thuộc về người dùng hiện tại không
    if (order.user_id !== req.session.user.id) {
      return res.status(403).render('error', {
        title: 'Truy cập bị từ chối',
        message: 'Bạn không có quyền xem đơn hàng này.'
      });
    }
    
    res.render('user/order-detail', {
      title: `Đơn hàng #${order.id}`,
      order
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    res.status(500).render('error', {
      title: 'Đã xảy ra lỗi',
      message: 'Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.'
    });
  }
});

// API hủy đơn hàng
router.post('/orders/:id/cancel', isAuthenticated, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do hủy đơn hàng.'
      });
    }
    
    const order = await orderModel.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại.'
      });
    }
    
    // Kiểm tra xem đơn hàng có thuộc về người dùng hiện tại không
    if (order.user_id !== req.session.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy đơn hàng này.'
      });
    }
    
    // Kiểm tra xem đơn hàng có thể hủy không (chỉ hủy được khi đang ở trạng thái "pending")
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng này không thể hủy do đã được xử lý.'
      });
    }
    
    // Cập nhật trạng thái đơn hàng
    const note = `Đơn hàng đã bị hủy bởi khách hàng. Lý do: ${reason}`;
    await orderModel.updateOrderStatus(orderId, 'cancelled', note);
    
    res.json({
      success: true,
      message: 'Đơn hàng đã được hủy thành công.'
    });
  } catch (error) {
    console.error('Lỗi khi hủy đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại sau.'
    });
  }
});

module.exports = router; 