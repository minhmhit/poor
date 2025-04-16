const { pool } = require('./db');

const orderModel = {
  // Lấy tất cả đơn hàng
  getAllOrders: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      throw error;
    }
  },

  // Lấy đơn hàng theo ID
  getOrderById: async (id) => {
    try {
      const [orders] = await pool.query(`
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `, [id]);
      
      if (orders.length === 0) return null;
      
      const order = orders[0];
      
      // Lấy các sản phẩm trong đơn hàng
      const [items] = await pool.query(`
        SELECT oi.*, p.name, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [id]);
      
      order.items = items;
      
      return order;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin đơn hàng ID ${id}:`, error);
      throw error;
    }
  },

  // Lấy đơn hàng theo user ID
  getOrdersByUserId: async (userId) => {
    try {
      const [rows] = await pool.query(`
        SELECT o.*, COUNT(oi.id) as total_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, [userId]);
      return rows;
    } catch (error) {
      console.error(`Lỗi khi lấy đơn hàng của người dùng ${userId}:`, error);
      throw error;
    }
  },

  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Thêm thông tin đơn hàng
      const [orderResult] = await connection.query(`
        INSERT INTO orders (
          user_id, total_amount, shipping_address, contact_phone, 
          customer_name, customer_email, payment_method, note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderData.userId, 
        orderData.totalAmount,
        orderData.address,
        orderData.phone,
        orderData.name,
        orderData.email,
        orderData.paymentMethod,
        orderData.note || null
      ]);
      
      const orderId = orderResult.insertId;
      
      // Thêm sản phẩm vào đơn hàng
      for (const item of orderData.items) {
        await connection.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `, [orderId, item.id, item.quantity, item.price]);
        
        // Cập nhật số lượng sản phẩm trong kho
        await connection.query(`
          UPDATE products 
          SET stock = stock - ? 
          WHERE id = ?
        `, [item.quantity, item.id]);
      }
      
      // Thêm trạng thái đơn hàng ban đầu
      await connection.query(`
        INSERT INTO order_status_history (order_id, status, note)
        VALUES (?, 'pending', 'Đơn hàng mới được tạo')
      `, [orderId]);
      
      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      console.error('Lỗi khi tạo đơn hàng:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: async (id, status, note = null) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Cập nhật trạng thái đơn hàng
      await connection.query(`
        UPDATE orders
        SET status = ?, updated_at = NOW()
        WHERE id = ?
      `, [status, id]);
      
      // Thêm vào lịch sử trạng thái
      await connection.query(`
        INSERT INTO order_status_history (order_id, status, note)
        VALUES (?, ?, ?)
      `, [id, status, note]);
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error(`Lỗi khi cập nhật trạng thái đơn hàng ID ${id}:`, error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // Thêm thông tin vận chuyển
  addShippingInfo: async (orderId, shippingData) => {
    try {
      const [result] = await pool.query(`
        INSERT INTO shipping (
          order_id, tracking_number, shipping_provider, 
          estimated_delivery_date, status
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        orderId,
        shippingData.trackingNumber,
        shippingData.provider,
        shippingData.estimatedDate,
        shippingData.status || 'processing'
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error(`Lỗi khi thêm thông tin vận chuyển cho đơn hàng ${orderId}:`, error);
      throw error;
    }
  },

  // Cập nhật thông tin vận chuyển
  updateShippingInfo: async (shippingId, shippingData) => {
    try {
      const [result] = await pool.query(`
        UPDATE shipping
        SET tracking_number = ?,
            shipping_provider = ?,
            estimated_delivery_date = ?,
            actual_delivery_date = ?,
            status = ?
        WHERE id = ?
      `, [
        shippingData.trackingNumber,
        shippingData.provider,
        shippingData.estimatedDate,
        shippingData.actualDate || null,
        shippingData.status,
        shippingId
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi cập nhật thông tin vận chuyển ${shippingId}:`, error);
      throw error;
    }
  },

  // Lấy thống kê đơn hàng theo trạng thái
  getOrderStats: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
      `);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê đơn hàng:', error);
      throw error;
    }
  },

  // Lấy lịch sử trạng thái của đơn hàng
  getOrderStatusHistory: async (orderId) => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM order_status_history
        WHERE order_id = ?
        ORDER BY created_at DESC
      `, [orderId]);
      
      return rows;
    } catch (error) {
      console.error(`Lỗi khi lấy lịch sử trạng thái đơn hàng ID ${orderId}:`, error);
      throw error;
    }
  },
  
  // Đếm số đơn hàng theo trạng thái
  countOrdersByStatus: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
      `);
      
      const result = {
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
        total: 0
      };
      
      rows.forEach(row => {
        result[row.status] = parseInt(row.count);
        result.total += parseInt(row.count);
      });
      
      return result;
    } catch (error) {
      console.error('Lỗi khi đếm đơn hàng theo trạng thái:', error);
      throw error;
    }
  }
};

module.exports = orderModel; 