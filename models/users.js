const { pool } = require('./db');
const bcrypt = require('bcrypt');

const userModel = {
  // Đăng ký người dùng mới
  register: async (userData) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Mã hóa mật khẩu
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Thiết lập role mặc định là 'customer' nếu không được cung cấp
      const userRole = userData.role || 'customer';
      
      // Thêm người dùng vào bảng users
      const [userResult] = await connection.query(`
        INSERT INTO users (name, email, password, role, status)
        VALUES (?, ?, ?, ?, ?)
      `, [userData.name, userData.email, hashedPassword, userRole, 'active']);
      
      const userId = userResult.insertId;
      
      // Thêm thông tin khách hàng vào bảng customers nếu có
      if (userData.phone || userData.address) {
        await connection.query(`
          INSERT INTO customers (user_id, phone, address, city, district, zipcode, email, name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId,
          userData.phone || null,
          userData.address || null,
          userData.city || null,
          userData.district || null,
          userData.zipcode || null,
          userData.email,
          userData.name
        ]);
      }
      
      await connection.commit();
      return userId;
    } catch (error) {
      await connection.rollback();
      console.error('Lỗi khi đăng ký người dùng:', error);
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // Kiểm tra đăng nhập
  login: async (email, password) => {
    try {
      // Lấy thông tin người dùng theo email
      const [users] = await pool.query(`
        SELECT * FROM users WHERE email = ?
      `, [email]);
      
      if (users.length === 0) {
        return { success: false, message: 'Email không tồn tại' };
      }
      
      const user = users[0];
      
      // Kiểm tra mật khẩu
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return { success: false, message: 'Mật khẩu không đúng' };
      }
      
      // Trả về thông tin người dùng (không bao gồm mật khẩu)
      const { password: _, ...userInfo } = user;
      return { success: true, user: userInfo };
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      throw error;
    }
  },
  
  // Lấy thông tin người dùng theo ID
  getUserById: async (id) => {
    try {
      const [users] = await pool.query(`
        SELECT * FROM users WHERE id = ?
      `, [id]);
      
      if (users.length === 0) return null;
      
      // Không trả về mật khẩu
      const { password, ...userInfo } = users[0];
      return userInfo;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng ID ${id}:`, error);
      throw error;
    }
  },
  
  // Lấy thông tin khách hàng theo user ID
  getCustomerByUserId: async (userId) => {
    try {
      const [customers] = await pool.query(`
        SELECT * FROM customers WHERE user_id = ?
      `, [userId]);
      
      return customers.length > 0 ? customers[0] : null;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin khách hàng của user ID ${userId}:`, error);
      throw error;
    }
  },
  
  // Cập nhật thông tin người dùng
  updateUser: async (userId, userData) => {
    try {
      const [result] = await pool.query(`
        UPDATE users SET name = ? WHERE id = ?
      `, [userData.name, userId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi cập nhật thông tin người dùng ID ${userId}:`, error);
      throw error;
    }
  },
  
  // Cập nhật hoặc tạo mới thông tin khách hàng
  updateCustomerInfo: async (userId, customerData) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Kiểm tra xem đã có thông tin khách hàng chưa
      const [customers] = await connection.query(`
        SELECT * FROM customers WHERE user_id = ?
      `, [userId]);
      
      // Lấy thông tin email và tên từ bảng users
      const [users] = await connection.query(`
        SELECT name, email FROM users WHERE id = ?
      `, [userId]);
      
      const userName = users[0]?.name || customerData.name;
      const userEmail = users[0]?.email || customerData.email;
      
      if (customers.length > 0) {
        // Cập nhật thông tin khách hàng nếu đã tồn tại
        await connection.query(`
          UPDATE customers
          SET phone = ?, address = ?, city = ?, district = ?, zipcode = ?, email = ?, name = ?, updated_at = NOW()
          WHERE user_id = ?
        `, [
          customerData.phone,
          customerData.address,
          customerData.city || null,
          customerData.district || null,
          customerData.zipcode || null,
          userEmail,
          userName,
          userId
        ]);
      } else {
        // Tạo mới thông tin khách hàng nếu chưa có
        await connection.query(`
          INSERT INTO customers (user_id, phone, address, city, district, zipcode, email, name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId,
          customerData.phone,
          customerData.address,
          customerData.city || null,
          customerData.district || null,
          customerData.zipcode || null,
          userEmail,
          userName
        ]);
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error(`Lỗi khi cập nhật thông tin khách hàng của user ID ${userId}:`, error);
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // Kiểm tra email đã tồn tại chưa
  checkEmailExists: async (email) => {
    try {
      const [users] = await pool.query(`
        SELECT COUNT(*) as count FROM users WHERE email = ?
      `, [email]);
      
      return users[0].count > 0;
    } catch (error) {
      console.error(`Lỗi khi kiểm tra email ${email}:`, error);
      throw error;
    }
  },
  
  // Đổi mật khẩu
  changePassword: async (userId, oldPassword, newPassword) => {
    try {
      // Lấy thông tin người dùng
      const [users] = await pool.query(`
        SELECT * FROM users WHERE id = ?
      `, [userId]);
      
      if (users.length === 0) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }
      
      // Kiểm tra mật khẩu cũ
      const match = await bcrypt.compare(oldPassword, users[0].password);
      if (!match) {
        return { success: false, message: 'Mật khẩu cũ không đúng' };
      }
      
      // Mã hóa mật khẩu mới
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Cập nhật mật khẩu
      await pool.query(`
        UPDATE users SET password = ? WHERE id = ?
      `, [hashedPassword, userId]);
      
      return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      console.error(`Lỗi khi đổi mật khẩu cho user ID ${userId}:`, error);
      throw error;
    }
  }
};

module.exports = userModel; 