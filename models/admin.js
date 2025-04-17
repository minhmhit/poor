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
  
  // Lấy danh sách người dùng theo bộ lọc
  getFilteredUsers: async (filters = {}) => {
    try {
      let query = `
        SELECT u.*, 
               (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
        FROM users u
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Lọc theo vai trò
      if (filters.role) {
        query += ` AND u.role = ?`;
        queryParams.push(filters.role);
      }
      
      // Lọc theo từ khóa tìm kiếm (tên, email)
      if (filters.q) {
        query += ` AND (
          u.name LIKE ? OR 
          u.email LIKE ?
        )`;
        const searchTerm = `%${filters.q}%`;
        queryParams.push(searchTerm, searchTerm);
      }
      
      // Lọc theo ngày đăng ký
      if (filters.date) {
        query += ` AND DATE(u.created_at) = ?`;
        queryParams.push(filters.date);
      }
      
      // Lọc theo trạng thái nếu có
      if (filters.status) {
        query += ` AND u.status = ?`;
        queryParams.push(filters.status);
      }
      
      query += ` ORDER BY u.created_at DESC`;
      
      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng có lọc:', error);
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
  },
  
  // ============== QUẢN LÝ HÓA ĐƠN ==============
  // Lưu hóa đơn
  saveInvoice: async (invoiceData) => {
    try {
      const { order_id, content, created_by } = invoiceData;
      
      const [result] = await pool.query(`
        INSERT INTO invoices (order_id, content, created_at, created_by)
        VALUES (?, ?, NOW(), ?)
      `, [order_id, content, created_by]);
      
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi lưu hóa đơn:', error);
      throw error;
    }
  },
  
  // Lấy danh sách hóa đơn theo khoảng thời gian
  getInvoices: async (startDate, endDate, page = 1, limit = 10) => {
    try {
      const offset = (page - 1) * limit;
      
      // Tạo câu truy vấn với điều kiện thời gian nếu có
      let query = `
        SELECT i.*, o.status as order_status, u.name as created_by_name, 
               (SELECT SUM(oi.quantity * oi.price) FROM order_items oi WHERE oi.order_id = i.order_id) as total_amount
        FROM invoices i
        LEFT JOIN orders o ON i.order_id = o.id
        LEFT JOIN users u ON i.created_by = u.id
      `;
      
      const queryParams = [];
      
      if (startDate && endDate) {
        query += ` WHERE i.created_at BETWEEN ? AND ?`;
        queryParams.push(startDate, endDate);
      }
      
      query += ` ORDER BY i.created_at DESC LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
      
      const [rows] = await pool.query(query, queryParams);
      
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hóa đơn:', error);
      throw error;
    }
  },
  
  // Đếm tổng số hóa đơn theo khoảng thời gian
  countInvoices: async (startDate, endDate) => {
    try {
      let query = `SELECT COUNT(*) as count FROM invoices`;
      const queryParams = [];
      
      if (startDate && endDate) {
        query += ` WHERE created_at BETWEEN ? AND ?`;
        queryParams.push(startDate, endDate);
      }
      
      const [rows] = await pool.query(query, queryParams);
      
      return rows[0].count;
    } catch (error) {
      console.error('Lỗi khi đếm hóa đơn:', error);
      throw error;
    }
  },
  
  // Lấy thông tin hóa đơn theo ID
  getInvoiceById: async (id) => {
    try {
      const [invoices] = await pool.query(`
        SELECT i.*, o.status as order_status, u.name as created_by_name
        FROM invoices i
        LEFT JOIN orders o ON i.order_id = o.id
        LEFT JOIN users u ON i.created_by = u.id
        WHERE i.id = ?
      `, [id]);
      
      return invoices.length > 0 ? invoices[0] : null;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin hóa đơn ID ${id}:`, error);
      throw error;
    }
  },
  
  // ============== BÁO CÁO THỐNG KÊ ==============
  // Thống kê doanh thu theo khoảng thời gian
  getSalesStats: async (startDate, endDate, period = 'day') => {
    try {
      // Lấy tổng doanh thu trong khoảng thời gian
      const [totalStats] = await pool.query(`
        SELECT 
          COUNT(DISTINCT o.id) as order_count,
          SUM(oi.quantity * oi.price) as revenue,
          SUM(oi.quantity * oi.price ) as profit
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.created_at BETWEEN ? AND ?
          AND o.status = 'completed'
      `, [startDate, endDate]);
      
      // SQL để nhóm theo ngày, tuần, tháng hoặc năm
      let groupByClause = '';
      if (period === 'day') {
        groupByClause = 'DATE(o.created_at)';
      } else if (period === 'week') {
        groupByClause = 'YEARWEEK(o.created_at, 1)';
      } else if (period === 'month') {
        groupByClause = 'DATE_FORMAT(o.created_at, "%Y-%m")';
      } else if (period === 'year') {
        groupByClause = 'YEAR(o.created_at)';
      }
      
      // Lấy doanh thu theo từng đơn vị thời gian
      const [byDateStats] = await pool.query(`
        SELECT 
          ${groupByClause} as date_group,
          DATE_FORMAT(o.created_at, "%Y-%m-%d") as date,
          COUNT(DISTINCT o.id) as order_count,
          SUM(oi.quantity * oi.price) as revenue,
          SUM(oi.quantity * oi.price ) as profit
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.created_at BETWEEN ? AND ?
          AND o.status = 'completed'
        GROUP BY date_group
        ORDER BY date_group
      `, [startDate, endDate]);
      
      return {
        total: totalStats[0] || { order_count: 0, revenue: 0, profit: 0 },
        byDate: byDateStats || []
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê doanh thu:', error);
      throw error;
    }
  },
  
  // Lấy top sản phẩm bán chạy
  getTopSellingProducts: async (startDate, endDate, limit = 10) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          p.id, 
          p.name, 
          
          SUM(oi.quantity) as quantity,
          SUM(oi.quantity * oi.price) as revenue,
          SUM(oi.quantity * oi.price) as profit
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at BETWEEN ? AND ?
          AND o.status = 'completed'
        GROUP BY p.id
        ORDER BY quantity DESC
        LIMIT ?
      `, [startDate, endDate, limit]);
      
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy top sản phẩm bán chạy:', error);
      throw error;
    }
  },
  
  // Lấy top khách hàng
  getTopCustomers: async (startDate, endDate, limit = 10) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          COUNT(DISTINCT o.id) as order_count,
          SUM(o.total_amount) as total_spent
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.created_at BETWEEN ? AND ?
          AND o.status = 'completed'
        GROUP BY u.id
        ORDER BY total_spent DESC
        LIMIT ?
      `, [startDate, endDate, limit]);
      
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy top khách hàng:', error);
      throw error;
    }
  }
};

module.exports = adminModel; 