-- Tạo database
CREATE DATABASE IF NOT EXISTS coffee_shop;
USE coffee_shop;

-- Tạo bảng categories
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng products
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng orders
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tạo bảng order_items
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Thêm dữ liệu mẫu cho categories
INSERT INTO categories (name, description) VALUES
('Cà phê Arabica', 'Loại cà phê cao cấp với hương vị thơm nhẹ, chua thanh.'),
('Cà phê Robusta', 'Loại cà phê có vị đắng mạnh, thích hợp pha phin truyền thống.'),
('Cà phê Blend', 'Sự kết hợp hoàn hảo giữa nhiều loại hạt cà phê khác nhau.');

-- Thêm dữ liệu mẫu cho products
INSERT INTO products (category_id, name, description, price, stock, image_url) VALUES
(1, 'Cà phê Arabica Cầu Đất', 'Cà phê Arabica được trồng tại Cầu Đất, Đà Lạt với độ cao 1650m.', 150000, 100, '/images/arabica-cau-dat.jpg'),
(1, 'Cà phê Arabica Moka', 'Cà phê Arabica giống Moka với hương vị chocolate đặc trưng.', 180000, 50, '/images/arabica-moka.jpg'),
(2, 'Cà phê Robusta Đắk Lắk', 'Cà phê Robusta được trồng tại Đắk Lắk, vùng đất đỏ bazan.', 120000, 200, '/images/robusta-daklak.jpg'),
(3, 'Cà phê Blend Truyền Thống', 'Blend giữa 30% Arabica và 70% Robusta, thích hợp pha phin.', 140000, 150, '/images/blend-truyen-thong.jpg'),
(3, 'Cà phê Blend Espresso', 'Blend đặc biệt dành cho máy Espresso, hậu vị caramel.', 160000, 80, '/images/blend-espresso.jpg');

-- Tạo tài khoản admin
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@coffeeshop.com', '$2b$10$X1HoqNQmRNCJHvvViD.RAO2UZdIGMP.QNmTiVmvaHWGR.HiNwB5N.', 'admin'); 