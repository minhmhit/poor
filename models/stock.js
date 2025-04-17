const { pool } = require('./db');

// Thay thế format từ date-fns bằng hàm tự cài đặt
function formatDate(date, format) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Chỉ hỗ trợ format yyyyMMdd
  if (format === 'yyyyMMdd') {
    return `${year}${month}${day}`;
  }
  
  return `${year}-${month}-${day}`;
}

const stockModel = {
  // Lấy tất cả phiếu nhập kho
  getAllStockImports: async (page = 1, limit = 10, filters = {}) => {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT si.*, s.name as supplier_name
        FROM stock_imports si
        LEFT JOIN suppliers s ON si.supplier_id = s.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Áp dụng các bộ lọc
      if (filters.supplier_id) {
        query += ` AND si.supplier_id = ?`;
        queryParams.push(filters.supplier_id);
      }
      
      if (filters.from_date) {
        query += ` AND si.import_date >= ?`;
        queryParams.push(filters.from_date);
      }
      
      if (filters.to_date) {
        query += ` AND si.import_date <= ?`;
        queryParams.push(filters.to_date);
      }
      
      if (filters.payment_status) {
        query += ` AND si.payment_status = ?`;
        queryParams.push(filters.payment_status);
      }
      
      query += ` ORDER BY si.import_date DESC, si.id DESC LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
      
      const [imports] = await pool.query(query, queryParams);
      
      // Đếm tổng số phiếu nhập
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM stock_imports si
        WHERE 1=1
      `;
      
      const countParams = [];
      
      if (filters.supplier_id) {
        countQuery += ` AND si.supplier_id = ?`;
        countParams.push(filters.supplier_id);
      }
      
      if (filters.from_date) {
        countQuery += ` AND si.import_date >= ?`;
        countParams.push(filters.from_date);
      }
      
      if (filters.to_date) {
        countQuery += ` AND si.import_date <= ?`;
        countParams.push(filters.to_date);
      }
      
      if (filters.payment_status) {
        countQuery += ` AND si.payment_status = ?`;
        countParams.push(filters.payment_status);
      }
      
      const [totalRows] = await pool.query(countQuery, countParams);
      const totalCount = totalRows[0].total;
      
      return {
        data: imports,
        pagination: {
          page,
          limit,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phiếu nhập kho:', error);
      throw error;
    }
  },

  // Lấy phiếu nhập kho theo ID
  getStockImportById: async (id) => {
    try {
      const [rows] = await pool.query(`
        SELECT si.*, s.name as supplier_name, u.name as created_by_name 
        FROM stock_imports si
        LEFT JOIN suppliers s ON si.supplier_id = s.id
        LEFT JOIN users u ON si.created_by = u.id
        WHERE si.id = ?
      `, [id]);
      
      if (rows.length === 0) return null;
      
      const stockImport = rows[0];
      
      // Lấy các sản phẩm trong phiếu nhập
      const [items] = await pool.query(`
        SELECT sii.*, p.name as product_name, p.image_url
        FROM stock_import_items sii
        JOIN products p ON sii.product_id = p.id
        WHERE sii.import_id = ?
      `, [id]);
      
      stockImport.items = items;
      
      return stockImport;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin phiếu nhập kho ID ${id}:`, error);
      throw error;
    }
  },

  // Lấy danh sách các mục trong phiếu nhập
  getStockImportItems: async (importId) => {
    try {
      const [rows] = await pool.query(`
        SELECT sii.*, p.name as product_name
        FROM stock_import_items sii
        JOIN products p ON sii.product_id = p.id
        WHERE sii.import_id = ?
        ORDER BY sii.id ASC
      `, [importId]);
      
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm trong phiếu nhập:', error);
      throw error;
    }
  },

  // Lấy phiếu nhập kho theo bộ lọc
  getFilteredStockImports: async (filters = {}) => {
    try {
      let query = `
        SELECT si.*, s.name as supplier_name, u.name as created_by_name 
        FROM stock_imports si
        LEFT JOIN suppliers s ON si.supplier_id = s.id
        LEFT JOIN users u ON si.created_by = u.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Lọc theo nhà cung cấp
      if (filters.supplier_id) {
        query += ` AND si.supplier_id = ?`;
        queryParams.push(filters.supplier_id);
      }
      
      // Lọc theo trạng thái thanh toán
      if (filters.payment_status) {
        query += ` AND si.payment_status = ?`;
        queryParams.push(filters.payment_status);
      }
      
      // Lọc theo từ ngày
      if (filters.from_date) {
        query += ` AND si.import_date >= ?`;
        queryParams.push(filters.from_date);
      }
      
      // Lọc theo đến ngày
      if (filters.to_date) {
        query += ` AND si.import_date <= ?`;
        queryParams.push(filters.to_date);
      }
      
      // Lọc theo mã phiếu nhập
      if (filters.import_code) {
        query += ` AND si.import_code LIKE ?`;
        queryParams.push(`%${filters.import_code}%`);
      }

      // Lọc theo tháng và năm
      if (filters.month && filters.year) {
        query += ` AND MONTH(si.import_date) = ? AND YEAR(si.import_date) = ?`;
        queryParams.push(filters.month, filters.year);
      } else if (filters.year) {
        // Chỉ lọc theo năm
        query += ` AND YEAR(si.import_date) = ?`;
        queryParams.push(filters.year);
      }
      
      query += ` ORDER BY si.import_date DESC`;
      
      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phiếu nhập kho theo bộ lọc:', error);
      throw error;
    }
  },

  // Tạo phiếu nhập kho mới
  createStockImport: async (importData, itemsData) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Tạo mã phiếu nhập tự động nếu không có
      if (!importData.import_code) {
        const todayFormatted = formatDate(new Date(), 'yyyyMMdd');
        const prefix = `NK-${todayFormatted}-`;
        
        // Tìm mã phiếu lớn nhất có cùng tiền tố ngày
        const [rows] = await connection.query(
          'SELECT import_code FROM stock_imports WHERE import_code LIKE ? ORDER BY id DESC LIMIT 1',
          [`${prefix}%`]
        );
        
        let nextNumber = 1;
        if (rows && rows.length > 0) {
          // Trích xuất số cuối cùng từ mã phiếu
          const lastCode = rows[0].import_code;
          const lastNumber = parseInt(lastCode.split('-')[2]);
          if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
          }
        }
        
        // Định dạng 3 số với các số 0 phía trước nếu cần
        const suffix = nextNumber.toString().padStart(3, '0');
        importData.import_code = `${prefix}${suffix}`;
      }
      
      // Thêm phiếu nhập kho
      const [importResult] = await connection.query(`
        INSERT INTO stock_imports (
          supplier_id, import_date, import_code, total_amount, 
          payment_status, note, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        importData.supplier_id || null,
        importData.import_date,
        importData.import_code,
        importData.total_amount || 0,
        importData.payment_status || 'unpaid',
        importData.note || null,
        importData.created_by,
        importData.created_at
      ]);
      
      const importId = importResult.insertId;
      
      // Thêm chi tiết sản phẩm và cập nhật số lượng tồn kho
      for (const item of itemsData) {
        // Thêm chi tiết sản phẩm vào phiếu nhập
        await connection.query(`
          INSERT INTO stock_import_items (
            import_id, product_id, quantity, import_price, total_price, created_at
          ) VALUES (?, ?, ?, ?, ?, NOW())
        `, [
          importId,
          item.product_id,
          item.quantity,
          item.import_price,
          item.total_price || (item.quantity * item.import_price),
          item.created_at
        ]);
        
        // Lấy số lượng hiện tại của sản phẩm
        const [stockResult] = await connection.query(`
          SELECT stock FROM products WHERE id = ?
        `, [item.product_id]);
        
        const currentStock = stockResult[0].stock;
        const newStock = currentStock + parseInt(item.quantity);
        
        // Cập nhật số lượng trong bảng products
        await connection.query(`
          UPDATE products 
          SET stock = ?, updated_at = NOW()
          WHERE id = ?
        `, [newStock, item.product_id]);
        
        // Ghi lịch sử thay đổi số lượng
        await connection.query(`
          INSERT INTO stock_history (
            product_id, before_quantity, change_quantity, after_quantity,
            source_type, source_id, note, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          item.product_id,
          currentStock,
          item.quantity,
          newStock,
          'import',
          importId,
          `Nhập kho từ phiếu ${importData.import_code}`,
          importData.created_by
        ]);
      }
      
      await connection.commit();
      return importId;
    } catch (error) {
      await connection.rollback();
      console.error('Lỗi khi tạo phiếu nhập kho:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // Cập nhật phiếu nhập kho
  updateStockImport: async (id, importData) => {
    try {
      const [result] = await pool.query(`
        UPDATE stock_imports
        SET supplier_id = ?,
            import_date = ?,
            payment_status = ?,
            note = ?,
            updated_at = NOW()
        WHERE id = ?
      `, [
        importData.supplier_id || null,
        importData.import_date,
        importData.payment_status || 'unpaid',
        importData.note || null,
        id
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi khi cập nhật phiếu nhập kho ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa phiếu nhập kho (chỉ cho phép nếu chưa cập nhật kho)
  deleteStockImport: async (id) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Kiểm tra nếu đã cập nhật kho thì không cho xóa
      const [historyCheck] = await connection.query(`
        SELECT COUNT(*) as count FROM stock_history
        WHERE source_type = 'import' AND source_id = ?
      `, [id]);
      
      if (historyCheck[0].count > 0) {
        // Có lịch sử cập nhật kho, thực hiện quy trình hoàn lại thay vì xóa
        
        // Lấy thông tin của phiếu nhập kho
        const stockImport = await this.getStockImportById(id);
        
        // Cho mỗi sản phẩm trong phiếu nhập kho, giảm số lượng tương ứng
        for (const item of stockImport.items) {
          // Lấy số lượng hiện tại của sản phẩm
          const [stockResult] = await connection.query(`
            SELECT stock FROM products WHERE id = ?
          `, [item.product_id]);
          
          const currentStock = stockResult[0].stock;
          
          // Kiểm tra nếu số lượng trong kho đủ để hoàn trả
          if (currentStock < item.quantity) {
            throw new Error(`Không thể xóa phiếu nhập kho vì số lượng sản phẩm ${item.product_name} trong kho không đủ để hoàn trả`);
          }
          
          const newStock = currentStock - parseInt(item.quantity);
          
          // Cập nhật số lượng trong bảng products
          await connection.query(`
            UPDATE products 
            SET stock = ?, updated_at = NOW()
            WHERE id = ?
          `, [newStock, item.product_id]);
          
          // Ghi lịch sử thay đổi số lượng
          await connection.query(`
            INSERT INTO stock_history (
              product_id, before_quantity, change_quantity, after_quantity,
              source_type, source_id, note, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `, [
            item.product_id,
            currentStock,
            -item.quantity,
            newStock,
            'adjustment',
            id,
            `Điều chỉnh do xóa phiếu nhập kho #${stockImport.import_code}`,
            stockImport.created_by
          ]);
        }
        
        // Đánh dấu phiếu nhập kho là đã xóa
        await connection.query(`
          UPDATE stock_imports
          SET note = CONCAT(IFNULL(note, ''), ' | Đã xóa ngày ', NOW())
          WHERE id = ?
        `, [id]);
      } else {
        // Chưa có lịch sử cập nhật kho, có thể xóa trực tiếp
        
        // Xóa chi tiết sản phẩm
        await connection.query(`
          DELETE FROM stock_import_items
          WHERE import_id = ?
        `, [id]);
        
        // Xóa phiếu nhập
        await connection.query(`
          DELETE FROM stock_imports
          WHERE id = ?
        `, [id]);
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error(`Lỗi khi xóa phiếu nhập kho ID ${id}:`, error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // Lấy lịch sử nhập kho theo sản phẩm
  getStockHistoryByProduct: async (productId) => {
    try {
      const [rows] = await pool.query(`
        SELECT sh.*, p.name as product_name, u.name as created_by_name
        FROM stock_history sh
        JOIN products p ON sh.product_id = p.id
        LEFT JOIN users u ON sh.created_by = u.id
        WHERE sh.product_id = ?
        ORDER BY sh.created_at DESC
      `, [productId]);
      
      return rows;
    } catch (error) {
      console.error(`Lỗi khi lấy lịch sử nhập kho cho sản phẩm ID ${productId}:`, error);
      throw error;
    }
  },

  // Lấy lịch sử nhập kho theo thời gian
  getStockHistoryByDate: async (fromDate, toDate, type = null) => {
    try {
      let query = `
        SELECT sh.*, p.name as product_name,  u.name as created_by_name
        FROM stock_history sh
        JOIN products p ON sh.product_id = p.id
        LEFT JOIN users u ON sh.created_by = u.id
        WHERE sh.created_at BETWEEN ? AND ?
      `;
      
      const queryParams = [fromDate, toDate];
      
      // Lọc theo loại nguồn (import, order, adjustment)
      if (type) {
        query += ` AND sh.source_type = ?`;
        queryParams.push(type);
      }
      
      query += ` ORDER BY sh.created_at DESC`;
      
      const [rows] = await pool.query(query, queryParams);
      
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử nhập kho theo thời gian:', error);
      throw error;
    }
  },

  // Lấy lịch sử kho gần đây
  getRecentStockHistory: async (limit = 100) => {
    try {
      const [rows] = await pool.query(`
        SELECT sh.*, p.name as product_name
        FROM stock_history sh
        JOIN products p ON sh.product_id = p.id
        ORDER BY sh.created_at DESC
        LIMIT ?
      `, [limit]);
      
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử kho gần đây:', error);
      throw error;
    }
  },

  // Lấy thống kê nhập kho theo khoảng thời gian
  getStockImportStatsByPeriod: async (year, month = null) => {
    try {
      // Dữ liệu mặc định nếu không có phiếu nhập
      const stats = {
        totalValue: 0,
        totalImports: 0,
        totalProducts: 0,
        totalQuantity: 0,
        topProducts: [],
        suppliers: [],
        chartData: {
          labels: [],
          values: []
        }
      };
      
      // Lấy tổng số phiếu và tổng giá trị
      let query = `
        SELECT 
          COUNT(DISTINCT si.id) as total_imports,
          SUM(si.total_amount) as total_value
        FROM stock_imports si
        WHERE YEAR(si.import_date) = ?
      `;
      
      const params = [year];
      
      if (month) {
        query += ` AND MONTH(si.import_date) = ?`;
        params.push(month);
      }
      
      const [totals] = await pool.query(query, params);
      
      if (totals && totals.length > 0) {
        stats.totalImports = totals[0].total_imports || 0;
        stats.totalValue = totals[0].total_value || 0;
      }
      
      // Lấy tổng số sản phẩm và tổng số lượng nhập
      query = `
        SELECT 
          COUNT(DISTINCT sii.product_id) as total_products,
          SUM(sii.quantity) as total_quantity
        FROM stock_import_items sii
        JOIN stock_imports si ON sii.import_id = si.id
        WHERE YEAR(si.import_date) = ?
      `;
      
      params[0] = year;
      
      if (month) {
        query += ` AND MONTH(si.import_date) = ?`;
        if (params.length > 1) {
          params[1] = month;
        } else {
          params.push(month);
        }
      }
      
      const [quantities] = await pool.query(query, params);
      
      if (quantities && quantities.length > 0) {
        stats.totalProducts = quantities[0].total_products || 0;
        stats.totalQuantity = quantities[0].total_quantity || 0;
      }
      
      // Lấy top 10 sản phẩm nhập nhiều nhất
      query = `
        SELECT 
          p.id,
          p.name,
          SUM(sii.quantity) as quantity,
          SUM(sii.total_price) as total_value
        FROM stock_import_items sii
        JOIN stock_imports si ON sii.import_id = si.id
        JOIN products p ON sii.product_id = p.id
        WHERE YEAR(si.import_date) = ?
      `;
      
      params[0] = year;
      
      if (month) {
        query += ` AND MONTH(si.import_date) = ?`;
        if (params.length > 1) {
          params[1] = month;
        } else {
          params.push(month);
        }
      }
      
      query += `
        GROUP BY p.id
        ORDER BY quantity DESC
        LIMIT 10
      `;
      
      const [topProducts] = await pool.query(query, params);
      
      if (topProducts && topProducts.length > 0) {
        stats.topProducts = topProducts.map(product => {
          return {
            ...product,
            percentage: stats.totalQuantity > 0 ? (product.quantity / stats.totalQuantity) * 100 : 0
          };
        });
      }
      
      // Lấy thống kê theo nhà cung cấp
      query = `
        SELECT 
          s.id,
          s.name,
          COUNT(DISTINCT si.id) as import_count,
          SUM(si.total_amount) as total_value
        FROM stock_imports si
        JOIN suppliers s ON si.supplier_id = s.id
        WHERE YEAR(si.import_date) = ?
      `;
      
      params[0] = year;
      
      if (month) {
        query += ` AND MONTH(si.import_date) = ?`;
        if (params.length > 1) {
          params[1] = month;
        } else {
          params.push(month);
        }
      }
      
      query += `
        GROUP BY s.id
        ORDER BY total_value DESC
      `;
      
      const [suppliers] = await pool.query(query, params);
      
      if (suppliers && suppliers.length > 0) {
        stats.suppliers = suppliers.map(supplier => {
          return {
            ...supplier,
            percentage: stats.totalValue > 0 ? (supplier.total_value / stats.totalValue) * 100 : 0
          };
        });
      }
      
      // Tạo dữ liệu biểu đồ
      let chartLabels = [];
      let chartValues = [];
      
      if (month) {
        // Tính số ngày trong tháng
        const daysInMonth = new Date(year, month, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const dayStr = String(day).padStart(2, '0');
          chartLabels.push(`${dayStr}/${month}`);
          
          // Lấy tổng giá trị nhập kho theo ngày
          const [dailyData] = await pool.query(`
            SELECT SUM(si.total_amount) as value
            FROM stock_imports si
            WHERE YEAR(si.import_date) = ? AND MONTH(si.import_date) = ? AND DAY(si.import_date) = ?
          `, [year, month, day]);
          
          chartValues.push(dailyData[0].value || 0);
        }
      } else {
        // Thống kê theo tháng trong năm
        for (let m = 1; m <= 12; m++) {
          chartLabels.push(`Tháng ${m}`);
          
          // Lấy tổng giá trị nhập kho theo tháng
          const [monthlyData] = await pool.query(`
            SELECT SUM(si.total_amount) as value
            FROM stock_imports si
            WHERE YEAR(si.import_date) = ? AND MONTH(si.import_date) = ?
          `, [year, m]);
          
          chartValues.push(monthlyData[0].value || 0);
        }
      }
      
      stats.chartData = {
        labels: chartLabels,
        values: chartValues
      };
      
      return stats;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê nhập kho:', error);
      throw error;
    }
  },
  
  // Tạo mã phiếu nhập mới
  generateImportCode: async () => {
    try {
      const todayFormatted = formatDate(new Date(), 'yyyyMMdd');
      const prefix = `NK-${todayFormatted}-`;
      
      // Tìm mã phiếu lớn nhất có cùng tiền tố ngày
      const [rows] = await pool.query(
        'SELECT import_code FROM stock_imports WHERE import_code LIKE ? ORDER BY id DESC LIMIT 1',
        [`${prefix}%`]
      );
      
      let nextNumber = 1;
      if (rows && rows.length > 0) {
        // Trích xuất số cuối cùng từ mã phiếu
        const lastCode = rows[0].import_code;
        const lastNumber = parseInt(lastCode.split('-')[2]);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
      
      // Định dạng 3 số với các số 0 phía trước nếu cần
      const suffix = nextNumber.toString().padStart(3, '0');
      return `${prefix}${suffix}`;
    } catch (error) {
      console.error('Lỗi khi tạo mã phiếu nhập mới:', error);
      return `NK-${formatDate(new Date(), 'yyyyMMdd')}-001`; // Mã mặc định nếu có lỗi
    }
  }
};

module.exports = stockModel; 