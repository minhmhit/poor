const { pool } = require('./db');

const productModel = {
  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT *, category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      throw error;
    }
  },

  // Lấy sản phẩm theo ID
  getProductById: async (id) => {
    try {
      const [rows] = await pool.query(`
        SELECT *, category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm với ID ${id}:`, error);
      throw error;
    }
  },

  // Lấy sản phẩm theo danh mục
  getProductsByCategory: async (categoryId) => {
    try {
      const [rows] = await pool.query(`
        SELECT *, category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.category_id = ?
        ORDER BY p.created_at DESC
      `, [categoryId]);
      return rows;
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm với danh mục ${categoryId}:`, error);
      throw error;
    }
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (keyword) => {
    try {
      const [rows] = await pool.query(`
        SELECT *, category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.name LIKE ? OR p.description LIKE ?
        ORDER BY p.created_at DESC
      `, [`%${keyword}%`, `%${keyword}%`]);
      return rows;
    } catch (error) {
      console.error(`Lỗi khi tìm kiếm sản phẩm với từ khóa ${keyword}:`, error);
      throw error;
    }
  },

  // Thêm sản phẩm mới
  addProduct: async (product) => {
    try {
      const [result] = await pool.query(`
        INSERT INTO products (category_id, name, description, price, stock, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        product.category_id,
        product.name,
        product.description,
        product.price,
        product.stock,
        product.image_url
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm mới:', error);
      throw error;
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, product) => {
    try {
      const [result] = await pool.query(`
        UPDATE products
        SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, image_url = ?
        WHERE id = ?
      `, [
        product.category_id,
        product.name,
        product.description,
        product.price,
        product.stock,
        product.image_url,
        id
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi cập nhật sản phẩm có ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi xóa sản phẩm có ID ${id}:`, error);
      throw error;
    }
  }
};

module.exports = productModel; 