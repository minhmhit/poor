const express = require('express');
const router = express.Router();
const productModel = require('../models/products');
const { Cart } = require('../models/cart');

// Trang giỏ hàng
router.get('/', (req, res) => {
  if (!req.session.cart) {
    return res.render('cart', { 
      title: 'Giỏ hàng',
      cart: { items: [], totalQty: 0, totalPrice: 0 }
    });
  }
  
  const cart = new Cart(req.session.cart);
  res.render('cart', { 
    title: 'Giỏ hàng',
    cart: { 
      items: cart.generateArray(),
      totalQty: cart.totalQty,
      totalPrice: cart.totalPrice
    }
  });
});

// Trang thanh toán
router.get('/checkout', (req, res) => {
  if (!req.session.cart || req.session.cart.totalQty === 0) {
    return res.redirect('/cart');
  }
  
  const cart = new Cart(req.session.cart);
  res.render('checkout', { 
    title: 'Thanh toán',
    cart: { 
      items: cart.generateArray(),
      totalQty: cart.totalQty,
      totalPrice: cart.totalPrice
    },
    user: req.session.user
  });
});

// Trang đặt hàng thành công
router.get('/success', (req, res) => {
  const orderId = req.query.orderId;
  res.render('order-success', { 
    title: 'Đặt hàng thành công',
    orderId 
  });
});

module.exports = router; 