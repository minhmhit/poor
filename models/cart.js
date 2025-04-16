const { pool } = require('./db');
const productModel = require('./products');
const orderModel = require('./orders');

class Cart {
  constructor(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;
  }

  add(product, id, quantity = 1) {
    let storedItem = this.items[id];
    
    if (!storedItem) {
      storedItem = this.items[id] = {
        item: product,
        qty: 0,
        price: 0
      };
    }
    
    storedItem.qty += quantity;
    storedItem.price = storedItem.item.price * storedItem.qty;
    this.totalQty += quantity;
    this.totalPrice += storedItem.item.price * quantity;
  }

  decreaseQty(id) {
    this.items[id].qty--;
    this.items[id].price = this.items[id].item.price * this.items[id].qty;
    this.totalQty--;
    this.totalPrice -= this.items[id].item.price;

    if (this.items[id].qty <= 0) {
      delete this.items[id];
    }
  }

  increaseQty(id) {
    this.items[id].qty++;
    this.items[id].price = this.items[id].item.price * this.items[id].qty;
    this.totalQty++;
    this.totalPrice += this.items[id].item.price;
  }

  updateQty(id, qty) {
    const oldQty = this.items[id].qty;
    const difference = qty - oldQty;
    
    this.items[id].qty = qty;
    this.items[id].price = this.items[id].item.price * qty;
    this.totalQty += difference;
    this.totalPrice += this.items[id].item.price * difference;

    if (this.items[id].qty <= 0) {
      delete this.items[id];
    }
  }

  removeItem(id) {
    this.totalQty -= this.items[id].qty;
    this.totalPrice -= this.items[id].price;
    delete this.items[id];
  }

  generateArray() {
    let arr = [];
    for (let id in this.items) {
      arr.push({
        id: id,
        item: this.items[id].item,
        qty: this.items[id].qty,
        price: this.items[id].price
      });
    }
    return arr;
  }

  clear() {
    this.items = {};
    this.totalQty = 0;
    this.totalPrice = 0;
  }
}

// Lưu giỏ hàng vào database khi đặt hàng
const saveCartToOrder = async (cart, userId, orderInfo) => {
  try {
    // Chuẩn bị dữ liệu đơn hàng
    const orderData = {
      userId: userId,
      totalAmount: cart.totalPrice,
      address: orderInfo.address,
      phone: orderInfo.phone,
      name: orderInfo.name,
      email: orderInfo.email,
      paymentMethod: orderInfo.payment || 'cod',
      note: orderInfo.note,
      items: cart.generateArray().map(item => ({
        id: item.id,
        quantity: item.qty,
        price: item.item.price
      }))
    };
    
    // Sử dụng orderModel để tạo đơn hàng
    const orderId = await orderModel.createOrder(orderData);
    return orderId;
  } catch (error) {
    console.error('Lỗi khi lưu giỏ hàng vào đơn hàng:', error);
    throw error;
  }
};

module.exports = {
  Cart,
  saveCartToOrder
}; 