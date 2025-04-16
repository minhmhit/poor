const { pool } = require('./db');

const adminModel = {
  // Lấy tổng số lượng theo các bảng
  getDashboardStats: async () => {
    try {
      // Lấy tổng số người dùng
      const [userStats] = await pool.query(`
        SELECT COUNT(*) as count FROM users
      `);
      
      // Lấy tổng số sản phẩm
      const [productStats] = await pool.query(`
        SELECT COUNT(*) as count FROM products
      `);
      
      // Lấy tổng số danh mục
      const [categoryStats] = await pool.query(`
        SELECT COUNT(*) as count FROM categories
      `);
      
      // Lấy tổng số đơn hàng
      const [orderStats] = await pool.query(`
        SELECT COUNT(*) as count FROM orders
      `);
      
      // Lấy tổng doanh thu
      const [revenueStats] = await pool.query(`
        SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'
      `);
      
      return {
        userCount: userStats[0].count,
        productCount: productStats[0].count,
        categoryCount: categoryStats[0].count,
        orderCount: orderStats[0].count,
        totalRevenue: revenueStats[0].total || 0
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê dashboard:', error);
      throw error;
    }
  },
  
  // Lấy danh sách tất cả người dùng
  getAllUsers: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT u.*, 
               (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
        FROM users u
        ORDER BY u.created_at DESC
      `);
      
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      throw error;
    }
  },
  
  // Lấy thông tin người dùng theo ID
  getUserById: async (id) => {
    try {
      // Lấy thông tin người dùng
      const [users] = await pool.query(`
        SELECT * FROM users WHERE id = ?
      `, [id]);
      
      if (users.length === 0) return null;
      
      const user = users[0];
      
      // Lấy thông tin khách hàng
      const [customers] = await pool.query(`
        SELECT * FROM customers WHERE user_id = ?
      `, [id]);
      
      if (customers.length > 0) {
        user.customerInfo = customers[0];
      }
      
      // Lấy danh sách đơn hàng
      const [orders] = await pool.query(`
        SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
      `, [id]);
      
      user.orders = orders;
      
      return user;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng ID ${id}:`, error);
      throw error;
    }
  },
  
  // Cập nhật quyền người dùng
  updateUserRole: async (id, role) => {
    try {
      const [result] = await pool.query(`
        UPDATE users SET role = ? WHERE id = ?
      `, [role, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi cập nhật quyền người dùng ID ${id}:`, error);
      throw error;
    }
  },
  
  // Đếm số người dùng theo quyền
  countUsersByRole: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
      `);
      
      const result = {
        admin: 0,
        customer: 0,
        total: 0
      };
      
      rows.forEach(row => {
        if (row.role) {
          result[row.role] = parseInt(row.count);
        }
        result.total += parseInt(row.count);
      });
      
      return result;
    } catch (error) {
      console.error('Lỗi khi đếm người dùng theo quyền:', error);
      throw error;
    }
  }
};

module.exports = adminModel; 