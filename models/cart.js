const { pool } = require('./db');
const productModel = require('./products');

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
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Lưu thông tin đơn hàng
      const [orderResult] = await connection.query(
        `INSERT INTO orders (user_id, total_amount, shipping_address, contact_phone, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [userId, cart.totalPrice, orderInfo.address, orderInfo.phone]
      );
      
      const orderId = orderResult.insertId;
      
      // Lưu chi tiết đơn hàng
      const cartItems = cart.generateArray();
      for (const item of cartItems) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.id, item.qty, item.item.price]
        );
        
        // Cập nhật số lượng sản phẩm
        await connection.query(
          `UPDATE products SET stock = stock - ? WHERE id = ?`,
          [item.qty, item.id]
        );
      }
      
      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Lỗi khi lưu giỏ hàng vào đơn hàng:', error);
    throw error;
  }
};

module.exports = {
  Cart,
  saveCartToOrder
}; 