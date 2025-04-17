const { pool } = require('./db');

const supplierModel = {
  // Lấy tất cả nhà cung cấp
  getAllSuppliers: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM suppliers
        ORDER BY name ASC
      `);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhà cung cấp:', error);
      throw error;
    }
  },

  // Lấy danh sách nhà cung cấp với bộ lọc
  getFilteredSuppliers: async (filters = {}) => {
    try {
      let query = `
        SELECT * FROM suppliers
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Lọc theo trạng thái
      if (filters.status) {
        query += ` AND status = ?`;
        queryParams.push(filters.status);
      }
      
      // Lọc theo từ khóa tìm kiếm (tên, email, điện thoại)
      if (filters.q) {
        query += ` AND (
          name LIKE ? OR 
          contact_person LIKE ? OR
          email LIKE ? OR
          phone LIKE ?
        )`;
        const searchTerm = `%${filters.q}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      query += ` ORDER BY name ASC`;
      
      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhà cung cấp theo bộ lọc:', error);
      throw error;
    }
  },

  // Lấy nhà cung cấp theo ID
  getSupplierById: async (id) => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM suppliers
        WHERE id = ?
      `, [id]);
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin nhà cung cấp ID ${id}:`, error);
      throw error;
    }
  },

  // Thêm nhà cung cấp mới
  addSupplier: async (data) => {
    try {
      const { name, contact_person, email, phone, address, description, status } = data;
      
      const [result] = await pool.query(`
        INSERT INTO suppliers (
          name, contact_person, email, phone, address, description, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        name, 
        contact_person || null, 
        email || null, 
        phone || null, 
        address || null, 
        description || null, 
        status || 'active'
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi thêm nhà cung cấp mới:', error);
      throw error;
    }
  },

  // Cập nhật nhà cung cấp
  updateSupplier: async (id, data) => {
    try {
      const { name, contact_person, email, phone, address, description, status } = data;
      
      const [result] = await pool.query(`
        UPDATE suppliers
        SET name = ?,
            contact_person = ?,
            email = ?,
            phone = ?,
            address = ?,
            description = ?,
            status = ?
        WHERE id = ?
      `, [
        name, 
        contact_person || null, 
        email || null, 
        phone || null, 
        address || null, 
        description || null, 
        status || 'active',
        id
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi cập nhật nhà cung cấp ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa nhà cung cấp
  deleteSupplier: async (id) => {
    try {
      // Kiểm tra xem nhà cung cấp có đang được sử dụng trong phiếu nhập nào không
      const [imports] = await pool.query(`
        SELECT COUNT(*) as count FROM stock_imports
        WHERE supplier_id = ?
      `, [id]);
      
      if (imports[0].count > 0) {
        throw new Error('Không thể xóa nhà cung cấp này vì đã có phiếu nhập kho liên quan');
      }
      
      const [result] = await pool.query(`
        DELETE FROM suppliers
        WHERE id = ?
      `, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi xóa nhà cung cấp ID ${id}:`, error);
      throw error;
    }
  },

  // Đếm tổng số nhà cung cấp
  countSuppliers: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT COUNT(*) as count FROM suppliers
      `);
      
      return rows[0].count;
    } catch (error) {
      console.error('Lỗi khi đếm số nhà cung cấp:', error);
      throw error;
    }
  }
};

module.exports = supplierModel; 