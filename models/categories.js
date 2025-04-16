const { pool } = require('./db');

const categoryModel = {
  // Lấy tất cả danh mục
  getAllCategories: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM categories
        ORDER BY category_name ASC
      `);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục:', error);
      throw error;
    }
  },

  // Lấy danh mục theo ID
  getCategoryById: async (id) => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM categories
        WHERE category_id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Lỗi khi lấy danh mục với ID ${id}:`, error);
      throw error;
    }
  },

  // Thêm danh mục mới
  addCategory: async (category) => {
    try {
      const [result] = await pool.query(`
        INSERT INTO categories (category_name, description)
        VALUES (?, ?)
      `, [
        category.category_name,
        category.description
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi thêm danh mục mới:', error);
      throw error;
    }
  },

  // Cập nhật danh mục
  updateCategory: async (id, category) => {
    try {
      const [result] = await pool.query(`
        UPDATE categories
        SET category_name = ?, description = ?
        WHERE category_id = ?
      `, [
        category.category_name,
        category.description,
        id
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi cập nhật danh mục có ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa danh mục
  deleteCategory: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM categories WHERE category_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi xóa danh mục có ID ${id}:`, error);
      throw error;
    }
  },

  // Đếm số sản phẩm trong danh mục
  countProductsInCategory: async (categoryId) => {
    try {
      const [rows] = await pool.query(`
        SELECT COUNT(*) as count
        FROM products
        WHERE category_id = ?
      `, [categoryId]);
      return rows[0].count;
    } catch (error) {
      console.error(`Lỗi khi đếm sản phẩm trong danh mục ${categoryId}:`, error);
      throw error;
    }
  }
};

module.exports = categoryModel; 