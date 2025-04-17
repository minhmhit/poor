-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th4 17, 2025 lúc 06:02 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `ace`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`, `description`, `created_at`) VALUES
(1, 'Cà phê Arabica', 'Loại cà phê cao cấp với hương vị thơm nhẹ, chua thanh.', '2025-04-16 12:21:50'),
(2, 'Cà phê Robusta', 'Loại cà phê có vị đắng mạnh, thích hợp pha phin truyền thống.', '2025-04-16 12:21:50'),
(3, 'Cà phê Blend', 'Sự kết hợp hoàn hảo giữa nhiều loại hạt cà phê khác nhau.', '2025-04-16 12:21:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `zipcode` varchar(20) DEFAULT NULL,
  `default_shipping` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `email` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','completed','cancelled') DEFAULT 'pending',
  `shipping_address` text NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `payment_method` varchar(50) NOT NULL,
  `note` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `shipping_address`, `contact_phone`, `created_at`, `updated_at`, `customer_name`, `customer_email`, `payment_method`, `note`) VALUES
(1, 1, 590000.00, 'pending', '1111111111111111111', '01111111111111', '2025-04-16 13:06:08', '2025-04-16 13:18:53', NULL, NULL, '', '0'),
(2, NULL, 180000.00, 'pending', '111111111111111111111', '01111111111111', '2025-04-16 13:35:35', '2025-04-16 13:35:35', 'Mai Hoàng Minh', 'nguyenvana@gmail.com', 'cod', NULL),
(3, NULL, 450000.00, 'pending', '111111', '2147483647', '2025-04-16 13:39:42', '2025-04-16 13:39:42', 'Mai Hoàng Minh', 'nguyenvana@gmail.com', 'cod', NULL),
(4, 2, 900000.00, 'processing', '11111111', '01111111111111', '2025-04-16 13:42:09', '2025-04-16 14:17:30', 'Mai Hoàng Minh', 'nguyenvana@gmail.com', 'cod', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 1, 150000.00),
(2, 1, 2, 1, 180000.00),
(3, 1, 3, 1, 120000.00),
(4, 1, 4, 1, 140000.00),
(5, 2, 2, 1, 180000.00),
(6, 3, 1, 1, 150000.00),
(7, 3, 2, 1, 180000.00),
(8, 3, 3, 1, 120000.00),
(9, 4, 1, 2, 150000.00),
(10, 4, 2, 1, 180000.00),
(11, 4, 3, 1, 120000.00),
(12, 4, 4, 1, 140000.00),
(13, 4, 5, 1, 160000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_status_history`
--

INSERT INTO `order_status_history` (`id`, `order_id`, `status`, `note`, `created_at`) VALUES
(1, 2, 'pending', 'Đơn hàng mới được tạo', '2025-04-16 13:35:35'),
(2, 3, 'pending', 'Đơn hàng mới được tạo', '2025-04-16 13:39:42'),
(3, 4, 'pending', 'Đơn hàng mới được tạo', '2025-04-16 13:42:09'),
(4, 4, 'processing', '', '2025-04-16 14:17:30');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `description`, `price`, `stock`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 1, 'Cà phê Arabica Cầu Đất', 'Cà phê Arabica được trồng tại Cầu Đất, Đà Lạt với độ cao 1650m.', 150000.00, 96, '/images/products/1.jpg', '2025-04-16 12:21:50', '2025-04-16 14:24:36'),
(2, 1, 'Cà phê Arabica Moka', 'Cà phê Arabica giống Moka với hương vị chocolate đặc trưng.', 180000.00, 46, '/images/products/2.jpg', '2025-04-16 12:21:50', '2025-04-16 14:24:47'),
(3, 2, 'Cà phê Robusta Đắk Lắk', 'Cà phê Robusta được trồng tại Đắk Lắk, vùng đất đỏ bazan.', 120000.00, 197, '/images/products/3.jpg', '2025-04-16 12:21:50', '2025-04-16 14:24:52'),
(4, 3, 'Cà phê Blend Truyền Thống', 'Blend giữa 30% Arabica và 70% Robusta, thích hợp pha phin.', 140000.00, 148, '/images/products/3.jpg', '2025-04-16 12:21:50', '2025-04-16 14:25:00'),
(5, 3, 'Cà phê Blend Espresso', 'Blend đặc biệt dành cho máy Espresso, hậu vị caramel.', 160000.00, 79, '/images/products/3.jpg', '2025-04-16 12:21:50', '2025-04-16 14:25:04'),
(6, 1, 'haaha', 'ahahahahah', 200000.00, 10, '/images/products/product-1744813429329-592076538.jpg', '2025-04-16 14:23:49', '2025-04-16 14:23:49');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shipping`
--

CREATE TABLE `shipping` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `shipping_provider` varchar(100) DEFAULT NULL,
  `estimated_delivery_date` date DEFAULT NULL,
  `actual_delivery_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stock_history`
--

CREATE TABLE `stock_history` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `before_quantity` int(11) NOT NULL,
  `change_quantity` int(11) NOT NULL,
  `after_quantity` int(11) NOT NULL,
  `source_type` enum('import','order','adjustment') NOT NULL,
  `source_id` int(11) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `stock_history`
--

INSERT INTO `stock_history` (`id`, `product_id`, `before_quantity`, `change_quantity`, `after_quantity`, `source_type`, `source_id`, `note`, `created_by`, `created_at`) VALUES
(1, 1, 0, 20, 20, 'import', 1, 'Nhập kho từ phiếu #NK-202310-0001', 1, '2025-04-17 08:00:00'),
(2, 2, 0, 15, 15, 'import', 1, 'Nhập kho từ phiếu #NK-202310-0001', 1, '2025-04-17 08:00:00'),
(3, 3, 0, 10, 10, 'import', 1, 'Nhập kho từ phiếu #NK-202310-0001', 1, '2025-04-17 08:00:00'),
(4, 4, 0, 2, 2, 'import', 2, 'Nhập kho từ phiếu #NK-202310-0002', 1, '2025-04-17 08:00:00'),
(5, 5, 0, 5, 5, 'import', 2, 'Nhập kho từ phiếu #NK-202310-0002', 1, '2025-04-17 08:00:00'),
(6, 6, 0, 40, 40, 'import', 3, 'Nhập kho từ phiếu #NK-202311-0001', 2, '2025-04-17 08:00:00'),
(7, 7, 0, 30, 30, 'import', 3, 'Nhập kho từ phiếu #NK-202311-0001', 2, '2025-04-17 08:00:00'),
(8, 8, 0, 20, 20, 'import', 4, 'Nhập kho từ phiếu #NK-202311-0002', 2, '2025-04-17 08:00:00'),
(9, 9, 0, 15, 15, 'import', 4, 'Nhập kho từ phiếu #NK-202311-0002', 2, '2025-04-17 08:00:00'),
(10, 1, 20, 30, 50, 'import', 5, 'Nhập kho từ phiếu #NK-202311-0003', 3, '2025-04-17 08:00:00'),
(11, 2, 15, 20, 35, 'import', 5, 'Nhập kho từ phiếu #NK-202311-0003', 3, '2025-04-17 08:00:00'),
(12, 1, 50, -2, 48, 'adjustment', NULL, 'Điều chỉnh do hao hụt', 1, '2025-04-17 08:00:00'),
(13, 2, 35, -1, 34, 'adjustment', NULL, 'Điều chỉnh do kiểm kê', 1, '2025-04-17 08:00:00'),
(14, 3, 10, -1, 9, 'adjustment', NULL, 'Điều chỉnh do lỗi', 2, '2025-04-17 08:00:00'),
(15, 8, 20, -5, 15, 'adjustment', NULL, 'Điều chỉnh do hết hạn', 2, '2025-04-17 08:00:00'),
(16, 9, 15, -2, 13, 'adjustment', NULL, 'Điều chỉnh do hỏng', 3, '2025-04-17 08:00:00'),
(17, 1, 48, -3, 45, 'order', 1, 'Đơn hàng #ORD-2023-001', NULL, '2025-04-17 08:00:00'),
(18, 2, 34, -2, 32, 'order', 1, 'Đơn hàng #ORD-2023-001', NULL, '2025-04-17 08:00:00'),
(19, 6, 40, -4, 36, 'order', 2, 'Đơn hàng #ORD-2023-002', NULL, '2025-04-17 08:00:00'),
(20, 8, 15, -3, 12, 'order', 3, 'Đơn hàng #ORD-2023-003', NULL, '2025-04-17 08:00:00'),
(21, 9, 13, -1, 12, 'order', 3, 'Đơn hàng #ORD-2023-003', NULL, '2025-04-17 08:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stock_imports`
--

CREATE TABLE `stock_imports` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `import_date` date NOT NULL,
  `import_code` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_status` enum('unpaid','partial','paid') DEFAULT 'unpaid',
  `note` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `stock_imports`
--

INSERT INTO `stock_imports` (`id`, `supplier_id`, `import_date`, `import_code`, `total_amount`, `payment_status`, `note`, `created_by`, `created_at`, `updated_at`) VALUES
(6, 1, '2023-10-15', 'NK-202310-0001', 5750000.00, 'paid', 'Nhập hạt cà phê Arabica và Robusta', 1, '2025-04-17 08:00:00', '2025-04-17 08:00:00'),
(7, 2, '2023-10-22', 'NK-202310-0002', 12000000.00, 'partial', 'Máy xay cà phê và phụ kiện', 1, '2025-04-17 08:00:00', '2025-04-17 08:00:00'),
(8, 3, '2023-11-05', 'NK-202311-0001', 3200000.00, 'unpaid', 'Nhập bộ cốc và ly mới', 2, '2025-04-17 08:00:00', '2025-04-17 08:00:00'),
(9, 4, '2023-11-12', 'NK-202311-0002', 2800000.00, 'paid', 'Nguyên liệu làm bánh và topping', 2, '2025-04-17 08:00:00', '2025-04-17 08:00:00'),
(10, 1, '2023-11-20', 'NK-202311-0003', 4500000.00, 'paid', 'Nhập cà phê hạt đợt 2', 3, '2025-04-17 08:00:00', '2025-04-17 08:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stock_import_items`
--

CREATE TABLE `stock_import_items` (
  `id` int(11) NOT NULL,
  `import_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `import_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `stock_import_items`
--

INSERT INTO `stock_import_items` (`id`, `import_id`, `product_id`, `quantity`, `import_price`, `total_price`, `note`) VALUES
(1, 1, 1, 20, 120000.00, 2400000.00, 'Cà phê Arabica hạt 1kg'),
(2, 1, 2, 15, 90000.00, 1350000.00, 'Cà phê Robusta hạt 1kg'),
(3, 1, 3, 10, 200000.00, 2000000.00, 'Cà phê Arabica Premium 1kg'),
(4, 2, 4, 2, 5000000.00, 10000000.00, 'Máy xay cà phê chuyên nghiệp'),
(5, 2, 5, 5, 400000.00, 2000000.00, 'Bình sữa tạo bọt'),
(6, 3, 6, 40, 50000.00, 2000000.00, 'Ly thủy tinh cao cấp'),
(7, 3, 7, 30, 40000.00, 1200000.00, 'Ly sứ espresso'),
(8, 4, 8, 20, 50000.00, 1000000.00, 'Siro hương vị trái cây'),
(9, 4, 9, 15, 120000.00, 1800000.00, 'Bột làm bánh'),
(10, 5, 1, 30, 100000.00, 3000000.00, 'Cà phê Arabica hạt 1kg'),
(11, 5, 2, 20, 75000.00, 1500000.00, 'Cà phê Robusta hạt 1kg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `email`, `phone`, `address`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Công ty TNHH Café Nguyên Chất', 'Nguyễn Văn An', 'sales@cafenguyenchat.com', '0901234567', '123 Nguyễn Trãi, Quận 5, TP.HCM', 'Nhà cung cấp cà phê hạt nguyên chất', 'active', '2025-04-17 07:59:45', '2025-04-17 07:59:45'),
(2, 'Công ty CP Thiết Bị Pha Chế', 'Trần Thị Bình', 'contact@thibipache.com', '0912345678', '45 Lê Lợi, Quận 1, TP.HCM', 'Chuyên cung cấp máy pha cà phê, máy xay', 'active', '2025-04-17 07:59:45', '2025-04-17 07:59:45'),
(3, 'Dụng Cụ Quầy Bar HN', 'Phạm Văn Cường', 'dungcu@barhn.com', '0823456789', '67 Trần Phú, Hà Nội', 'Ly, cốc, dụng cụ pha chế', 'active', '2025-04-17 07:59:45', '2025-04-17 07:59:45'),
(4, 'Công ty TNHH Thực Phẩm Sạch', 'Lê Thị Dung', 'order@tpsinh.vn', '0934567890', '89 Nguyễn Huệ, Quận 1, TP.HCM', 'Nguyên liệu làm bánh, đồ uống', 'active', '2025-04-17 07:59:45', '2025-04-17 07:59:45'),
(5, 'Nhập Khẩu Trà Cao Cấp', 'Đinh Văn Em', 'info@tracacocap.com', '0845678901', '34 Bà Triệu, Hà Nội', 'Chuyên nhập khẩu trà cao cấp từ các nước', 'inactive', '2025-04-17 07:59:45', '2025-04-17 07:59:45'),
(6, 'Công ty TNHH Café Nguyên Chất', 'Nguyễn Văn An', 'sales@cafenguyenchat.com', '0901234567', '123 Nguyễn Trãi, Quận 5, TP.HCM', 'Nhà cung cấp cà phê hạt nguyên chất', 'active', '2025-04-17 08:00:00', '2025-04-17 08:00:00'),
(7, 'Công ty CP Thiết Bị Pha Chế', 'Trần Thị Bình', 'contact@thibipache.com', '0912345678', '45 Lê Lợi, Quận 1, TP.HCM', 'Chuyên cung cấp máy pha cà phê, máy xay', 'active', '2025-04-17 08:00:00', '2025-04-17 08:00:00'),
(8, 'Dụng Cụ Quầy Bar HN', 'Phạm Văn Cường', 'dungcu@barhn.com', '0823456789', '67 Trần Phú, Hà Nội', 'Ly, cốc, dụng cụ pha chế', 'active', '2025-04-17 08:00:00', '2025-04-17 08:00:00'),
(9, 'Công ty TNHH Thực Phẩm Sạch', 'Lê Thị Dung', 'order@tpsinh.vn', '0934567890', '89 Nguyễn Huệ, Quận 1, TP.HCM', 'Nguyên liệu làm bánh, đồ uống', 'active', '2025-04-17 08:00:00', '2025-04-17 08:00:00'),
(10, 'Nhập Khẩu Trà Cao Cấp', 'Đinh Văn Em', 'info@tracacocap.com', '0845678901', '34 Bà Triệu, Hà Nội', 'Chuyên nhập khẩu trà cao cấp từ các nước', 'inactive', '2025-04-17 08:00:00', '2025-04-17 08:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','customer','warehouse','sale','manager') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Admin', 'admin@coffeeshop.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'admin', '2025-04-16 12:21:50'),
(2, 'Mai Hoàng Minh', 'nguyenvana@gmail.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'admin', '2025-04-16 13:40:33'),
(3, 'Nguyễn Hoài Nam', 'nam@gmail.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'manager', '2025-04-17 09:18:55'),
(4, 'Nguyễn Đức Minh', 'minh@gmail.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'warehouse', '2025-04-17 09:19:29'),
(5, 'enum', 'enum@gmail.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'customer', '2025-04-17 09:19:29'),
(6, 'Phạm Thiên Phúc', 'phuc@gmail.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'sale', '2025-04-17 09:19:55');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Chỉ mục cho bảng `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Chỉ mục cho bảng `shipping`
--
ALTER TABLE `shipping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Chỉ mục cho bảng `stock_history`
--
ALTER TABLE `stock_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Chỉ mục cho bảng `stock_imports`
--
ALTER TABLE `stock_imports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `import_code` (`import_code`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Chỉ mục cho bảng `stock_import_items`
--
ALTER TABLE `stock_import_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `import_id` (`import_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `shipping`
--
ALTER TABLE `shipping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `stock_history`
--
ALTER TABLE `stock_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT cho bảng `stock_imports`
--
ALTER TABLE `stock_imports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `stock_import_items`
--
ALTER TABLE `stock_import_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `shipping`
--
ALTER TABLE `shipping`
  ADD CONSTRAINT `shipping_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `stock_history`
--
ALTER TABLE `stock_history`
  ADD CONSTRAINT `stock_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_history_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `stock_imports`
--
ALTER TABLE `stock_imports`
  ADD CONSTRAINT `stock_imports_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_imports_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `stock_import_items`
--
ALTER TABLE `stock_import_items`
  ADD CONSTRAINT `stock_import_items_ibfk_1` FOREIGN KEY (`import_id`) REFERENCES `stock_imports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_import_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
