# Hệ Thống Bán Cà Phê Bột Online

Dự án website bán cà phê bột sử dụng Node.js, Express, EJS và MySQL.

## Tính năng

- Hiển thị danh sách sản phẩm cà phê theo danh mục
- Trang chi tiết sản phẩm với thông tin đầy đủ
- Giỏ hàng và hệ thống thanh toán
- Quản lý đơn hàng
- Trang quản trị admin

## Cài đặt

### Yêu cầu

- Node.js >= 14.x
- MySQL >= 8.0

### Các bước cài đặt

1. Clone repository:

   ```
   git clone <repository-url>
   cd coffee-shop
   ```

2. Cài đặt các gói phụ thuộc:

   ```
   npm install
   ```

3. Tạo file .env với nội dung:

   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=coffee_shop
   ```

4. Thiết lập cơ sở dữ liệu:

   ```
   npm run setup-db
   ```

   Hoặc mở MySQL và chạy file `database/setup.sql`

5. Khởi động ứng dụng:

   ```
   npm start
   ```

   Hoặc chạy chế độ phát triển:

   ```
   npm run dev
   ```

6. Truy cập ứng dụng tại `http://localhost:3000`

## Cấu trúc thư mục

```
coffee-shop/
  ├── app.js                 # File chính của ứng dụng
  ├── package.json           # Khai báo dependencies
  ├── .env                   # Cấu hình môi trường
  ├── database/              # Thư mục chứa script SQL
  │   └── setup.sql          # Script tạo database
  ├── models/                # Các model để tương tác với database
  │   ├── db.js              # Kết nối database
  │   └── products.js        # Model sản phẩm
  ├── controllers/           # Controllers xử lý logic
  ├── routes/                # Định nghĩa routes
  ├── views/                 # Template EJS
  │   ├── index.ejs          # Trang chủ
  │   ├── product-detail.ejs # Trang chi tiết sản phẩm
  │   └── partials/          # Các thành phần tái sử dụng
  │       ├── header.ejs     # Header chung
  │       └── footer.ejs     # Footer chung
  └── public/                # Tài nguyên tĩnh
      ├── css/               # Stylesheet
      │   └── styles.css     # CSS chính
      ├── js/                # JavaScript
      │   └── main.js        # JS chính
      └── images/            # Hình ảnh
```

## Tác giả

[Tên tác giả] - [Email liên hệ]

## Giấy phép

Dự án được phân phối dưới giấy phép ISC. Xem file `LICENSE` để biết thêm thông tin.
