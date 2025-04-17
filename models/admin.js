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
      
      // Chuyển đổi permissions từ JSON sang mảng nếu có
      if (user.permissions && typeof user.permissions === 'string') {
        try {
          user.permissions = JSON.parse(user.permissions);
        } catch (e) {
          user.permissions = [];
        }
      } else {
        user.permissions = [];
      }
      
      return user;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng ID ${id}:`, error);
      throw error;
    }
  },
  
  // Lấy thông tin người dùng theo email
  getUserByEmail: async (email) => {
    try {
      const [users] = await pool.query(`
        SELECT * FROM users WHERE email = ?
      `, [email]);
      
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng với email ${email}:`, error);
      throw error;
    }
  },
  
  // Tạo người dùng mới
  createUser: async (userData) => {
    try {
      const { name, email, password, phone, address, role, status } = userData;
      
      // Hash mật khẩu trước khi lưu vào DB
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const [result] = await pool.query(`
        INSERT INTO users (name, email, password,   role, status, created_at)
        VALUES (?, ?, ?, ?,  ?, NOW())
      `, [name, email, hashedPassword,  role || 'customer', status || 'active']);
      
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo người dùng mới:', error);
      throw error;
    }
  },
  
  // Xóa người dùng
  deleteUser: async (id) => {
    try {
      const [result] = await pool.query(`
        DELETE FROM users WHERE id = ?
      `, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi xóa người dùng ID ${id}:`, error);
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
  
  // Cập nhật trạng thái tài khoản
  updateUserStatus: async (id, status) => {
    try {
      const [result] = await pool.query(`
        UPDATE users SET status = ? WHERE id = ?
      `, [status, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi cập nhật trạng thái người dùng ID ${id}:`, error);
      throw error;
    }
  },
  
  // Cập nhật thông tin tài khoản
  updateUserInfo: async (id, userData) => {
    try {
      const { name, email, phone, address } = userData;
      
      const [result] = await pool.query(`
        UPDATE users 
        SET name = ?, email = ?, phone = ?, address = ?, updated_at = NOW()
        WHERE id = ?
      `, [name, email, phone, address, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi cập nhật thông tin người dùng ID ${id}:`, error);
      throw error;
    }
  },
  
  // Cập nhật quyền người dùng
  updateUserPermissions: async (id, permissions) => {
    try {
      // Lưu dưới dạng JSON
      const permissionsJSON = JSON.stringify(permissions);
      
      const [result] = await pool.query(`
        UPDATE users SET permissions = ? WHERE id = ?
      `, [permissionsJSON, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi cập nhật quyền chi tiết cho người dùng ID ${id}:`, error);
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
        warehouse: 0,
        manager: 0,
        sale: 0,
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