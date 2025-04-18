-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th4 18, 2025 lúc 10:00 PM
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
-- Cấu trúc bảng cho bảng `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `content` text NOT NULL COMMENT 'Lưu nội dung đơn hàng dưới dạng JSON',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL COMMENT 'ID người tạo hóa đơn',
  `notes` text DEFAULT NULL,
  `invoice_number` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `invoices`
--

INSERT INTO `invoices` (`id`, `order_id`, `content`, `created_at`, `created_by`, `notes`, `invoice_number`) VALUES
(1, 1, '{\"id\":1,\"user_id\":2,\"customer_name\":\"Nguyễn Văn A\",\"customer_email\":\"nguyenvana@example.com\",\"contact_phone\":\"0987654321\",\"shipping_address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"payment_method\":\"cod\",\"status\":\"completed\",\"note\":\"Giao vào buổi sáng\",\"total_amount\":590000,\"created_at\":\"2023-06-15 09:30:00\",\"updated_at\":\"2023-06-15 14:20:00\",\"user_name\":\"Nguyễn Văn A\",\"user_email\":\"nguyenvana@example.com\",\"items\":[{\"id\":1,\"order_id\":1,\"product_id\":3,\"quantity\":2,\"price\":295000,\"name\":\"Áo thun nam\",\"image_url\":\"/images/products/ao-thun-1.jpg\"}]}', '2023-06-15 15:00:00', 1, NULL, 'INV-2023-001'),
(2, 2, '{\"id\":2,\"user_id\":3,\"customer_name\":\"Trần Thị B\",\"customer_email\":\"tranthib@example.com\",\"contact_phone\":\"0901234567\",\"shipping_address\":\"456 Đường XYZ, Quận 2, TP.HCM\",\"payment_method\":\"banking\",\"status\":\"completed\",\"note\":\"\",\"total_amount\":850000,\"created_at\":\"2023-06-18 10:45:00\",\"updated_at\":\"2023-06-18 16:30:00\",\"user_name\":\"Trần Thị B\",\"user_email\":\"tranthib@example.com\",\"items\":[{\"id\":2,\"order_id\":2,\"product_id\":5,\"quantity\":1,\"price\":450000,\"name\":\"Quần jean nam\",\"image_url\":\"/images/products/quan-jean-1.jpg\"},{\"id\":3,\"order_id\":2,\"product_id\":7,\"quantity\":1,\"price\":400000,\"name\":\"Áo khoác nữ\",\"image_url\":\"/images/products/ao-khoac-1.jpg\"}]}', '2023-06-18 17:00:00', 1, NULL, 'INV-2023-002'),
(3, 3, '{\"id\":3,\"user_id\":4,\"customer_name\":\"Lê Văn C\",\"customer_email\":\"levanc@example.com\",\"contact_phone\":\"0912345678\",\"shipping_address\":\"789 Đường MNO, Quận 3, TP.HCM\",\"payment_method\":\"cod\",\"status\":\"completed\",\"note\":\"Gọi trước khi giao\",\"total_amount\":1200000,\"created_at\":\"2023-07-05 14:20:00\",\"updated_at\":\"2023-07-05 18:45:00\",\"user_name\":\"Lê Văn C\",\"user_email\":\"levanc@example.com\",\"items\":[{\"id\":4,\"order_id\":3,\"product_id\":9,\"quantity\":1,\"price\":1200000,\"name\":\"Giày thể thao nam\",\"image_url\":\"/images/products/giay-1.jpg\"}]}', '2023-07-05 19:00:00', 2, NULL, 'INV-2023-003'),
(4, 4, '{\"id\":4,\"user_id\":5,\"customer_name\":\"Phạm Thị D\",\"customer_email\":\"phamthid@example.com\",\"contact_phone\":\"0976543210\",\"shipping_address\":\"101 Đường PQR, Quận 4, TP.HCM\",\"payment_method\":\"banking\",\"status\":\"completed\",\"note\":\"\",\"total_amount\":750000,\"created_at\":\"2023-07-12 09:15:00\",\"updated_at\":\"2023-07-12 15:40:00\",\"user_name\":\"Phạm Thị D\",\"user_email\":\"phamthid@example.com\",\"items\":[{\"id\":5,\"order_id\":4,\"product_id\":12,\"quantity\":3,\"price\":250000,\"name\":\"Áo sơ mi nữ\",\"image_url\":\"/images/products/ao-somi-1.jpg\"}]}', '2023-07-12 16:00:00', 1, NULL, 'INV-2023-004'),
(5, 5, '{\"id\":5,\"user_id\":2,\"customer_name\":\"Nguyễn Văn A\",\"customer_email\":\"nguyenvana@example.com\",\"contact_phone\":\"0987654321\",\"shipping_address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"payment_method\":\"cod\",\"status\":\"completed\",\"note\":\"\",\"total_amount\":1500000,\"created_at\":\"2023-08-03 11:30:00\",\"updated_at\":\"2023-08-03 17:20:00\",\"user_name\":\"Nguyễn Văn A\",\"user_email\":\"nguyenvana@example.com\",\"items\":[{\"id\":6,\"order_id\":5,\"product_id\":15,\"quantity\":1,\"price\":1500000,\"name\":\"Túi xách nữ\",\"image_url\":\"/images/products/tui-xach-1.jpg\"}]}', '2023-08-03 18:00:00', 2, NULL, 'INV-2023-005'),
(6, 6, '{\"id\":6,\"user_id\":3,\"customer_name\":\"Trần Thị B\",\"customer_email\":\"tranthib@example.com\",\"contact_phone\":\"0901234567\",\"shipping_address\":\"456 Đường XYZ, Quận 2, TP.HCM\",\"payment_method\":\"banking\",\"status\":\"completed\",\"note\":\"Giao vào buổi tối\",\"total_amount\":980000,\"created_at\":\"2023-08-20 15:45:00\",\"updated_at\":\"2023-08-20 19:30:00\",\"user_name\":\"Trần Thị B\",\"user_email\":\"tranthib@example.com\",\"items\":[{\"id\":7,\"order_id\":6,\"product_id\":18,\"quantity\":2,\"price\":490000,\"name\":\"Đồng hồ nam\",\"image_url\":\"/images/products/dong-ho-1.jpg\"}]}', '2023-08-20 20:00:00', 1, NULL, 'INV-2023-006'),
(7, 7, '{\"id\":7,\"user_id\":4,\"customer_name\":\"Lê Văn C\",\"customer_email\":\"levanc@example.com\",\"contact_phone\":\"0912345678\",\"shipping_address\":\"789 Đường MNO, Quận 3, TP.HCM\",\"payment_method\":\"cod\",\"status\":\"completed\",\"note\":\"\",\"total_amount\":2200000,\"created_at\":\"2023-09-08 10:20:00\",\"updated_at\":\"2023-09-08 16:45:00\",\"user_name\":\"Lê Văn C\",\"user_email\":\"levanc@example.com\",\"items\":[{\"id\":8,\"order_id\":7,\"product_id\":20,\"quantity\":1,\"price\":2200000,\"name\":\"Laptop sleeve\",\"image_url\":\"/images/products/laptop-sleeve-1.jpg\"}]}', '2023-09-08 17:00:00', 2, NULL, 'INV-2023-007'),
(8, 8, '{\"id\":8,\"user_id\":5,\"customer_name\":\"Phạm Thị D\",\"customer_email\":\"phamthid@example.com\",\"contact_phone\":\"0976543210\",\"shipping_address\":\"101 Đường PQR, Quận 4, TP.HCM\",\"payment_method\":\"banking\",\"status\":\"completed\",\"note\":\"Gọi trước khi giao\",\"total_amount\":650000,\"created_at\":\"2023-09-15 14:30:00\",\"updated_at\":\"2023-09-15 19:20:00\",\"user_name\":\"Phạm Thị D\",\"user_email\":\"phamthid@example.com\",\"items\":[{\"id\":9,\"order_id\":8,\"product_id\":22,\"quantity\":1,\"price\":650000,\"name\":\"Balo nam\",\"image_url\":\"/images/products/balo-1.jpg\"}]}', '2023-09-15 20:00:00', 1, NULL, 'INV-2023-008'),
(9, 9, '{\"id\":9,\"user_id\":2,\"customer_name\":\"Nguyễn Văn A\",\"customer_email\":\"nguyenvana@example.com\",\"contact_phone\":\"0987654321\",\"shipping_address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"payment_method\":\"cod\",\"status\":\"completed\",\"note\":\"\",\"total_amount\":1850000,\"created_at\":\"2023-10-05 09:15:00\",\"updated_at\":\"2023-10-05 15:40:00\",\"user_name\":\"Nguyễn Văn A\",\"user_email\":\"nguyenvana@example.com\",\"items\":[{\"id\":10,\"order_id\":9,\"product_id\":25,\"quantity\":1,\"price\":1850000,\"name\":\"Áo khoác nam cao cấp\",\"image_url\":\"/images/products/ao-khoac-nam-2.jpg\"}]}', '2023-10-05 16:00:00', 2, NULL, 'INV-2023-009'),
(10, 10, '{\"id\":10,\"user_id\":3,\"customer_name\":\"Trần Thị B\",\"customer_email\":\"tranthib@example.com\",\"contact_phone\":\"0901234567\",\"shipping_address\":\"456 Đường XYZ, Quận 2, TP.HCM\",\"payment_method\":\"banking\",\"status\":\"completed\",\"note\":\"\",\"total_amount\":3500000,\"created_at\":\"2023-10-18 11:30:00\",\"updated_at\":\"2023-10-18 17:20:00\",\"user_name\":\"Trần Thị B\",\"user_email\":\"tranthib@example.com\",\"items\":[{\"id\":11,\"order_id\":10,\"product_id\":28,\"quantity\":1,\"price\":3500000,\"name\":\"Váy dạ hội\",\"image_url\":\"/images/products/vay-1.jpg\"}]}', '2023-10-18 18:00:00', 1, NULL, 'INV-2023-010'),
(11, 4, '{\"id\":4,\"user_id\":2,\"total_amount\":\"900000.00\",\"status\":\"completed\",\"shipping_address\":\"11111111\",\"contact_phone\":\"01111111111111\",\"created_at\":\"2025-04-16T13:42:09.000Z\",\"updated_at\":\"2025-04-17T17:33:12.000Z\",\"customer_name\":\"Mai Hoàng Minh\",\"customer_email\":\"nguyenvana@gmail.com\",\"payment_method\":\"cod\",\"note\":null,\"user_name\":\"Mai Hoàng Minh\",\"user_email\":\"nguyenvana@gmail.com\",\"items\":[{\"id\":9,\"order_id\":4,\"product_id\":1,\"quantity\":2,\"price\":\"150000.00\",\"name\":\"Cà phê Arabica Cầu Đất\",\"image_url\":\"/images/products/1.jpg\"},{\"id\":10,\"order_id\":4,\"product_id\":2,\"quantity\":1,\"price\":\"180000.00\",\"name\":\"Cà phê Arabica Moka\",\"image_url\":\"/images/products/2.jpg\"},{\"id\":11,\"order_id\":4,\"product_id\":3,\"quantity\":1,\"price\":\"120000.00\",\"name\":\"Cà phê Robusta Đắk Lắk\",\"image_url\":\"/images/products/3.jpg\"},{\"id\":12,\"order_id\":4,\"product_id\":4,\"quantity\":1,\"price\":\"140000.00\",\"name\":\"Cà phê Blend Truyền Thống\",\"image_url\":\"/images/products/3.jpg\"},{\"id\":13,\"order_id\":4,\"product_id\":5,\"quantity\":1,\"price\":\"160000.00\",\"name\":\"Cà phê Blend Espresso\",\"image_url\":\"/images/products/3.jpg\"}]}', '2025-04-18 15:50:49', 2, NULL, NULL),
(12, 4, '{\"id\":4,\"user_id\":2,\"total_amount\":\"900000.00\",\"status\":\"completed\",\"shipping_address\":\"11111111\",\"contact_phone\":\"01111111111111\",\"created_at\":\"2025-04-16T13:42:09.000Z\",\"updated_at\":\"2025-04-17T17:33:12.000Z\",\"customer_name\":\"Mai Hoàng Minh\",\"customer_email\":\"nguyenvana@gmail.com\",\"payment_method\":\"cod\",\"note\":null,\"user_name\":\"Mai Hoàng Minh\",\"user_email\":\"nguyenvana@gmail.com\",\"items\":[{\"id\":9,\"order_id\":4,\"product_id\":1,\"quantity\":2,\"price\":\"150000.00\",\"name\":\"Cà phê Arabica Cầu Đất\",\"image_url\":\"/images/products/1.jpg\"},{\"id\":10,\"order_id\":4,\"product_id\":2,\"quantity\":1,\"price\":\"180000.00\",\"name\":\"Cà phê Arabica Moka\",\"image_url\":\"/images/products/2.jpg\"},{\"id\":11,\"order_id\":4,\"product_id\":3,\"quantity\":1,\"price\":\"120000.00\",\"name\":\"Cà phê Robusta Đắk Lắk\",\"image_url\":\"/images/products/3.jpg\"},{\"id\":12,\"order_id\":4,\"product_id\":4,\"quantity\":1,\"price\":\"140000.00\",\"name\":\"Cà phê Blend Truyền Thống\",\"image_url\":\"/images/products/3.jpg\"},{\"id\":13,\"order_id\":4,\"product_id\":5,\"quantity\":1,\"price\":\"160000.00\",\"name\":\"Cà phê Blend Espresso\",\"image_url\":\"/images/products/3.jpg\"}]}', '2025-04-18 15:51:14', 2, NULL, NULL),
(13, 4, '{\"id\":4,\"user_id\":2,\"total_amount\":\"900000.00\",\"status\":\"completed\",\"shipping_address\":\"11111111\",\"contact_phone\":\"01111111111111\",\"created_at\":\"2025-04-16T13:42:09.000Z\",\"updated_at\":\"2025-04-17T17:33:12.000Z\",\"customer_name\":\"Mai Hoàng Minh\",\"customer_email\":\"nguyenvana@gmail.com\",\"payment_method\":\"cod\",\"note\":null,\"user_name\":\"Mai Hoàng Minh\",\"user_email\":\"nguyenvana@gmail.com\",\"items\":[{\"id\":9,\"order_id\":4,\"product_id\":1,\"quantity\":2,\"price\":\"150000.00\",\"name\":\"Cà phê Arabica Cầu Đất\",\"image_url\":\"/images/products/1.jpg\"},{\"id\":10,\"order_id\":4,\"product_id\":2,\"quantity\":1,\"price\":\"180000.00\",\"name\":\"Cà phê Arabica Moka\",\"image_url\":\"/images/products/2.jpg\"},{\"id\":11,\"order_id\":4,\"product_id\":3,\"quantity\":1,\"price\":\"120000.00\",\"name\":\"Cà phê Robusta Đắk Lắk\",\"image_url\":\"/images/products/3.jpg\"},{\"id\":12,\"order_id\":4,\"product_id\":4,\"quantity\":1,\"price\":\"140000.00\",\"name\":\"Cà phê Blend Truyền Thống\",\"image_url\":\"/images/products/3.jpg\"},{\"id\":13,\"order_id\":4,\"product_id\":5,\"quantity\":1,\"price\":\"160000.00\",\"name\":\"Cà phê Blend Espresso\",\"image_url\":\"/images/products/3.jpg\"}]}', '2025-04-18 15:52:22', 2, NULL, NULL),
(14, 4, '{\"id\":4,\"user_id\":2,\"total_amount\":\"900000.00\",\"status\":\"completed\",\"shipping_address\":\"11111111\",\"contact_phone\":\"01111111111111\",\"created_at\":\"2025-04-16T13:42:09.000Z\",\"updated_at\":\"2025-04-17T17:33:12.000Z\",\"customer_name\":\"Mai Hoàng Minh\",\"customer_email\":\"nguyenvana@gmail.com\",\"payment_method\":\"cod\",\"note\":null,\"user_name\":\"Mai Hoàng Minh\",\"user_email\":\"nguyenvana@gmail.com\",\"items\":[{\"id\":9,\"order_id\":4,\"product_id\":1,\"quantity\":2,\"price\":\"150000.00\",\"name\":\"Cà phê Arabica Cầu Đất\",\"image_url\":\"/images/products/1.jpg\"},{\"id\":10,\"order_id\":4,\"product_id\":2,\"quantity\":1,\"price\":\"180000.00\",\"name\":\"Cà phê Arabica Moka\",\"image_url\":\"/images/products/2.jpg\"},{\"id\":11,\"order_id\":4,\"product_id\":3,\"quantity\":1,\"price\":\"120000.00\",\"name\":\"Cà phê Robusta Đắk Lắk\",\"image_url\":\"/images/products/3.jpg\"},{\"id\":12,\"order_id\":4,\"product_id\":4,\"quantity\":1,\"price\":\"140000.00\",\"name\":\"Cà phê Blend Truyền Thống\",\"image_url\":\"/images/products/3.jpg\"},{\"id\":13,\"order_id\":4,\"product_id\":5,\"quantity\":1,\"price\":\"160000.00\",\"name\":\"Cà phê Blend Espresso\",\"image_url\":\"/images/products/3.jpg\"}]}', '2025-04-18 15:52:47', 2, NULL, NULL),
(15, 5, '{\"id\":5,\"user_id\":8,\"total_amount\":\"3120000.00\",\"status\":\"completed\",\"shipping_address\":\"hcm\",\"contact_phone\":\"0935704208\",\"created_at\":\"2025-04-18T09:37:25.000Z\",\"updated_at\":\"2025-04-18T09:38:48.000Z\",\"customer_name\":\"Minh47\",\"customer_email\":\"minh47@gmail.com\",\"payment_method\":\"cod\",\"note\":null,\"user_name\":\"Minh47\",\"user_email\":\"minh47@gmail.com\",\"items\":[{\"id\":15,\"order_id\":5,\"product_id\":19,\"quantity\":1,\"price\":\"270000.00\",\"name\":\"Ký Ức Nhẹ Nhàng\",\"image_url\":\"/images/products/product-1744961547877-196606409.jpg\"},{\"id\":16,\"order_id\":5,\"product_id\":20,\"quantity\":1,\"price\":\"280000.00\",\"name\":\"Serene Sapa\",\"image_url\":\"/images/products/product-1744961579463-706773370.jpg\"},{\"id\":17,\"order_id\":5,\"product_id\":21,\"quantity\":1,\"price\":\"300000.00\",\"name\":\"Suối Nguồn Arabica\",\"image_url\":\"/images/products/product-1744961604810-924794842.jpg\"},{\"id\":18,\"order_id\":5,\"product_id\":22,\"quantity\":6,\"price\":\"345000.00\",\"name\":\"Hương Cỏ Xanh\",\"image_url\":\"/images/products/product-1744961643412-407747172.jpg\"}]}', '2025-04-18 16:38:52', 2, NULL, NULL),
(16, 5, '{\"id\":5,\"user_id\":8,\"total_amount\":\"3120000.00\",\"status\":\"completed\",\"shipping_address\":\"hcm\",\"contact_phone\":\"0935704208\",\"created_at\":\"2025-04-18T09:37:25.000Z\",\"updated_at\":\"2025-04-18T09:38:48.000Z\",\"customer_name\":\"Minh47\",\"customer_email\":\"minh47@gmail.com\",\"payment_method\":\"cod\",\"note\":null,\"user_name\":\"Minh47\",\"user_email\":\"minh47@gmail.com\",\"items\":[{\"id\":15,\"order_id\":5,\"product_id\":19,\"quantity\":1,\"price\":\"270000.00\",\"name\":\"Ký Ức Nhẹ Nhàng\",\"image_url\":\"/images/products/product-1744961547877-196606409.jpg\"},{\"id\":16,\"order_id\":5,\"product_id\":20,\"quantity\":1,\"price\":\"280000.00\",\"name\":\"Serene Sapa\",\"image_url\":\"/images/products/product-1744961579463-706773370.jpg\"},{\"id\":17,\"order_id\":5,\"product_id\":21,\"quantity\":1,\"price\":\"300000.00\",\"name\":\"Suối Nguồn Arabica\",\"image_url\":\"/images/products/product-1744961604810-924794842.jpg\"},{\"id\":18,\"order_id\":5,\"product_id\":22,\"quantity\":6,\"price\":\"345000.00\",\"name\":\"Hương Cỏ Xanh\",\"image_url\":\"/images/products/product-1744961643412-407747172.jpg\"}]}', '2025-04-19 01:16:31', 2, NULL, NULL),
(17, 5, '{\"id\":5,\"user_id\":8,\"total_amount\":\"3120000.00\",\"status\":\"completed\",\"shipping_address\":\"hcm\",\"contact_phone\":\"0935704208\",\"created_at\":\"2025-04-18T09:37:25.000Z\",\"updated_at\":\"2025-04-18T09:38:48.000Z\",\"customer_name\":\"Minh47\",\"customer_email\":\"minh47@gmail.com\",\"payment_method\":\"cod\",\"note\":null,\"user_name\":\"Minh47\",\"user_email\":\"minh47@gmail.com\",\"items\":[{\"id\":15,\"order_id\":5,\"product_id\":19,\"quantity\":1,\"price\":\"270000.00\",\"name\":\"Ký Ức Nhẹ Nhàng\",\"image_url\":\"/images/products/product-1744961547877-196606409.jpg\"},{\"id\":16,\"order_id\":5,\"product_id\":20,\"quantity\":1,\"price\":\"280000.00\",\"name\":\"Serene Sapa\",\"image_url\":\"/images/products/product-1744961579463-706773370.jpg\"},{\"id\":17,\"order_id\":5,\"product_id\":21,\"quantity\":1,\"price\":\"300000.00\",\"name\":\"Suối Nguồn Arabica\",\"image_url\":\"/images/products/product-1744961604810-924794842.jpg\"},{\"id\":18,\"order_id\":5,\"product_id\":22,\"quantity\":6,\"price\":\"345000.00\",\"name\":\"Hương Cỏ Xanh\",\"image_url\":\"/images/products/product-1744961643412-407747172.jpg\"}]}', '2025-04-19 01:58:00', 2, NULL, NULL);

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
(1, 1, 590000.00, 'completed', '1111111111111111111', '01111111111111', '2025-04-16 13:06:08', '2025-04-18 19:04:52', NULL, NULL, '', '0'),
(2, NULL, 180000.00, 'completed', '111111111111111111111', '01111111111111', '2025-04-16 13:35:35', '2025-04-17 17:33:22', 'Mai Hoàng Minh', 'nguyenvana@gmail.com', 'cod', NULL),
(3, NULL, 450000.00, 'completed', '111111', '2147483647', '2025-04-16 13:39:42', '2025-04-18 08:10:20', 'Mai Hoàng Minh', 'nguyenvana@gmail.com', 'cod', NULL),
(4, 2, 900000.00, 'pending', '11111111', '01111111111111', '2025-04-16 13:42:09', '2025-04-18 08:54:03', 'Mai Hoàng Minh', 'nguyenvana@gmail.com', 'cod', NULL),
(5, 8, 3120000.00, 'completed', 'hcm', '0935704208', '2025-04-18 09:37:25', '2025-04-18 09:38:48', 'Minh47', 'minh47@gmail.com', 'cod', NULL);

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
(13, 4, 5, 1, 160000.00),
(15, 5, 19, 1, 270000.00),
(16, 5, 20, 1, 280000.00),
(17, 5, 21, 1, 300000.00),
(18, 5, 22, 6, 345000.00);

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
(4, 4, 'processing', '', '2025-04-16 14:17:30'),
(5, 4, 'completed', '', '2025-04-17 17:33:12'),
(6, 2, 'completed', '', '2025-04-17 17:33:22'),
(7, 3, 'completed', '', '2025-04-18 08:10:20'),
(8, 4, 'pending', '', '2025-04-18 08:54:03'),
(9, 5, 'pending', 'Đơn hàng mới được tạo', '2025-04-18 09:37:25'),
(10, 5, 'completed', '', '2025-04-18 09:38:48'),
(11, 1, 'completed', '', '2025-04-18 19:04:52');

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
(2, 1, 'Cà phê Arabica Moka', 'Cà phê Arabica giống Moka với hương vị chocolate đặc trưng.', 180000.00, 56, '/images/products/2.jpg', '2025-04-16 12:21:50', '2025-04-18 09:40:15'),
(3, 2, 'Cà phê Robusta Đắk Lắk', 'Cà phê Robusta được trồng tại Đắk Lắk, vùng đất đỏ bazan.', 120000.00, 197, '/images/products/3.jpg', '2025-04-16 12:21:50', '2025-04-16 14:24:52'),
(4, 3, 'Cà phê Blend Truyền Thống', 'Blend giữa 30% Arabica và 70% Robusta, thích hợp pha phin.', 140000.00, 148, '/images/products/3.jpg', '2025-04-16 12:21:50', '2025-04-16 14:25:00'),
(5, 3, 'Cà phê Blend Espresso', 'Blend đặc biệt dành cho máy Espresso, hậu vị caramel.', 160000.00, 79, '/images/products/3.jpg', '2025-04-16 12:21:50', '2025-04-16 14:25:04'),
(7, 3, 'Lộc Xuân Blend', 'Hương vị đậm đà, hậu vị ngọt dịu, phù hợp cho người yêu cà phê nguyên bản.', 150000.00, 40, '/images/products/product-1744961018900-561035340.jpg', '2025-04-18 07:23:38', '2025-04-18 09:40:15'),
(8, 1, 'Sương Mai Arabica', 'Cà phê rang vừa với mùi hương thanh khiết, chua nhẹ đầy cuốn hút', 200000.00, 10, '/images/products/product-1744961050333-434596023.jpg', '2025-04-18 07:24:10', '2025-04-18 07:24:10'),
(9, 2, 'Bình Minh Vàng', 'Vị cà phê cân bằng, hậu vị kéo dài, phù hợp cho những buổi sáng nhẹ nhàng.', 300000.00, 20, '/images/products/product-1744961083771-612611471.jpg', '2025-04-18 07:24:43', '2025-04-18 07:24:43'),
(10, 1, 'Đồi Gió Nhẹ', 'Thơm nhẹ mùi trái cây, vị chua thanh và hậu vị tinh tế.', 250000.00, 30, '/images/products/product-1744961114992-990537292.jpg', '2025-04-18 07:25:14', '2025-04-18 07:25:14'),
(11, 1, 'Tuyết Hoa Cầu Đất', 'Cà phê cao cấp với hương hoa thoảng nhẹ, vị chua dịu và tròn vị.', 100000.00, 50, '/images/products/product-1744961147131-653583857.jpg', '2025-04-18 07:25:47', '2025-04-18 07:25:47'),
(12, 3, 'Thanh Nhã Roast', 'Sự kết hợp hoàn hảo giữa nhiều loại hạt cà phê khác nhau.', 123000.00, 20, '/images/products/product-1744961334313-681653017.jpg', '2025-04-18 07:28:44', '2025-04-18 07:28:54'),
(13, 2, 'Silky Breeze', 'Vị mượt mà, hương thơm dịu dàng, phù hợp để thưởng thức chậm rãi.', 400000.00, 20, '/images/products/product-1744961364389-246581461.jpg', '2025-04-18 07:29:24', '2025-04-18 07:29:24'),
(14, 1, 'Highland Dew', 'Dòng cà phê tinh khiết với hậu vị chua nhẹ và hương thơm đặc trưng', 200000.00, 10, '/images/products/product-1744961394963-16156862.jpg', '2025-04-18 07:29:54', '2025-04-18 07:29:54'),
(15, 3, 'Đà Lạt Garden', 'Hương vị đặc trưng của vùng cao nguyên, chua thanh và thanh mát.', 150000.00, 20, '/images/products/product-1744961427083-601468043.jpg', '2025-04-18 07:30:27', '2025-04-18 07:30:27'),
(16, 2, 'Làn Gió Rang Nhẹ', 'Cà phê rang nhẹ, giữ trọn hương vị tự nhiên và thanh thoát', 260000.00, 0, '/images/products/product-1744961453144-399705885.jpg', '2025-04-18 07:30:53', '2025-04-18 07:30:53'),
(17, 3, 'Modern Mist', 'Vị cà phê nhẹ nhàng, tươi sáng, phù hợp với phong cách hiện đại', 260000.00, 20, '/images/products/product-1744961485814-77406517.jpg', '2025-04-18 07:31:25', '2025-04-18 07:31:25'),
(18, 3, 'Tinh Túy Specialty', 'Đậm chất cà phê specialty, hậu vị sạch và mượt mà.', 340000.00, 10, '/images/products/product-1744961513093-226339853.jpg', '2025-04-18 07:31:53', '2025-04-18 07:31:53'),
(19, 1, 'Ký Ức Nhẹ Nhàng', 'Hương vị nhẹ nhưng sâu lắng, chua nhẹ tạo điểm nhấn khó quên.', 270000.00, 19, '/images/products/product-1744961547877-196606409.jpg', '2025-04-18 07:32:27', '2025-04-18 09:37:25'),
(20, 3, 'Serene Sapa', 'Tinh tế trong từng ngụm, cà phê nhẹ chua và giàu hương thơm.', 280000.00, 19, '/images/products/product-1744961579463-706773370.jpg', '2025-04-18 07:32:59', '2025-04-18 09:37:25'),
(21, 1, 'Suối Nguồn Arabica', 'Cà phê cao cấp với vị thanh khiết và cảm giác nhẹ nhàng khi thưởng thức.', 300000.00, 19, '/images/products/product-1744961604810-924794842.jpg', '2025-04-18 07:33:24', '2025-04-18 09:37:25'),
(22, 2, 'Hương Cỏ Xanh', 'Cà phê đặc sản với hương thơm tự nhiên và chua dịu tinh tế.', 345000.00, 14, '/images/products/product-1744961643412-407747172.jpg', '2025-04-18 07:34:03', '2025-04-18 09:37:25');

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
(20, 8, 15, -3, 12, 'order', 3, 'Đơn hàng #ORD-2023-003', NULL, '2025-04-17 08:00:00'),
(21, 9, 13, -1, 12, 'order', 3, 'Đơn hàng #ORD-2023-003', NULL, '2025-04-17 08:00:00'),
(23, 7, 30, 10, 40, 'import', 13, 'Nhập kho từ phiếu NK-20250418-002', 2, '2025-04-18 09:40:15'),
(24, 2, 46, 10, 56, 'import', 13, 'Nhập kho từ phiếu NK-20250418-002', 2, '2025-04-18 09:40:15');

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
(10, 1, '2023-11-20', 'NK-202311-0003', 4500000.00, 'paid', 'Nhập cà phê hạt đợt 2', 3, '2025-04-17 08:00:00', '2025-04-17 08:00:00'),
(12, 7, '2025-04-17', 'NK-20250418-001', 200000.00, '', NULL, 2, '2025-04-17 17:50:22', '2025-04-17 17:50:22'),
(13, 5, '2025-04-18', 'NK-20250418-002', 3300000.00, 'partial', NULL, 2, '2025-04-18 09:40:15', '2025-04-18 09:40:15');

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
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `stock_import_items`
--

INSERT INTO `stock_import_items` (`id`, `import_id`, `product_id`, `quantity`, `import_price`, `total_price`, `note`, `created_at`) VALUES
(1, 1, 1, 20, 120000.00, 2400000.00, 'Cà phê Arabica hạt 1kg', NULL),
(2, 1, 2, 15, 90000.00, 1350000.00, 'Cà phê Robusta hạt 1kg', NULL),
(3, 1, 3, 10, 200000.00, 2000000.00, 'Cà phê Arabica Premium 1kg', NULL),
(4, 2, 4, 2, 5000000.00, 10000000.00, 'Máy xay cà phê chuyên nghiệp', NULL),
(5, 2, 5, 5, 400000.00, 2000000.00, 'Bình sữa tạo bọt', NULL),
(7, 3, 7, 30, 40000.00, 1200000.00, 'Ly sứ espresso', NULL),
(8, 4, 8, 20, 50000.00, 1000000.00, 'Siro hương vị trái cây', NULL),
(9, 4, 9, 15, 120000.00, 1800000.00, 'Bột làm bánh', NULL),
(10, 5, 1, 30, 100000.00, 3000000.00, 'Cà phê Arabica hạt 1kg', NULL),
(11, 5, 2, 20, 75000.00, 1500000.00, 'Cà phê Robusta hạt 1kg', NULL),
(13, 13, 7, 10, 150000.00, 1500000.00, NULL, '2025-04-18 09:40:15'),
(14, 13, 2, 10, 180000.00, 1800000.00, NULL, '2025-04-18 09:40:15');

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
(12, 'Mai Hoàng Minh', 'Mai Minh', 'maihoangminh2005@gmail.com', '0935704208', 'Cách mạng tháng tám phường bến thành quận 1', NULL, 'active', '2025-04-18 18:49:03', '2025-04-18 18:49:03');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `status`) VALUES
(1, 'Admin', 'admin@coffeeshop.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'admin', '2025-04-16 12:21:50', 'active'),
(2, 'Mai Hoàng Minh', 'nguyenvana@gmail.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'admin', '2025-04-16 13:40:33', 'active'),
(3, 'Nguyễn Hoài Nam', 'nam@gmail.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'manager', '2025-04-17 09:18:55', 'active'),
(4, 'Nguyễn Đức Minh', 'minh@gmail.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'warehouse', '2025-04-17 09:19:29', 'active'),
(5, 'enum', 'enum@gmail.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'customer', '2025-04-17 09:19:29', 'active'),
(6, 'Phạm Thiên Phúc', 'phuc@gmail.com', '$2b$10$D.DJ2g05AziwWg/99SXvOOedwkiOQmptEabPcJn2DZR9W7etygwOS', 'sale', '2025-04-17 09:19:55', 'active'),
(7, 'Nguyễn Văn A', '111@gmail.com', '$2b$10$hmkfkzO..7f3st0IffZaGOOuQ6ivfPmoPGaojCn/I1uta0TiStQn6', 'sale', '2025-04-17 16:35:57', 'active'),
(8, 'Minh47', 'minh47@gmail.com', '$2b$10$ZjF6Beg6nLiLmY/YYoO8VenLUvemifFfdudOh7iz447erbZLy8Sce', 'customer', '2025-04-18 07:36:23', 'active'),
(9, 'Thanh Nhã Roast', 'nha@gmail.com', '$2b$10$3bzpdXgw3mmZ7ivDftg9k.lZuCHoPu3xONPKeCKXgHXkorBOrTo82', '', '2025-04-18 18:08:58', 'active');

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
-- Chỉ mục cho bảng `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_invoices_orders` (`order_id`),
  ADD KEY `fk_invoices_users` (`created_by`);

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
-- AUTO_INCREMENT cho bảng `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `shipping`
--
ALTER TABLE `shipping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `stock_history`
--
ALTER TABLE `stock_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT cho bảng `stock_imports`
--
ALTER TABLE `stock_imports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `stock_import_items`
--
ALTER TABLE `stock_import_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoices_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_invoices_users` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

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
