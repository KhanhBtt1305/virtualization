-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 02, 2025 lúc 09:12 AM
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
-- Cơ sở dữ liệu: `bus_map`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bus`
--

CREATE TABLE `bus` (
  `bus_id` varchar(20) NOT NULL,
  `license_plate` varchar(50) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `default_route_id` varchar(20) DEFAULT NULL,
  `status` varchar(100) DEFAULT 'Ngưng hoạt động',
  `departure_status` varchar(100) DEFAULT 'Chưa xuất phát',
  `registry` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `bus`
--

INSERT INTO `bus` (`bus_id`, `license_plate`, `capacity`, `default_route_id`, `status`, `departure_status`, `registry`) VALUES
('XB1', '59B-99999', 25, 'TD1', 'Đang hoạt động', 'Chưa xuất phát', NULL),
('XB2', '59A-12345', 20, 'TD2', 'Đang hoạt động', 'Chưa xuất phát', NULL),
('XB3', '59C-88888', 10, NULL, 'Ngưng hoạt động', 'Chưa xuất phát', NULL),
('XE001', '59B-32167', 16, 'R01', 'Đang hoạt động', 'Đã xuất phát', '2027-11-10'),
('XE002', '59B-98012', 16, NULL, 'Đang hoạt động', 'Chưa xuất phát', '2026-11-03'),
('XE003', '59-15602', 16, NULL, 'Đang bảo trì', 'Đã kết thúc', '2029-11-15'),
('XE004', '59C-48822', 16, NULL, 'Ngưng hoạt động', 'Chưa xuất phát', '2025-11-19'),
('XE005', '59A-32512', 16, 'TD3', 'Đang hoạt động', 'Đã xuất phát', '2025-11-22');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bus_location`
--

CREATE TABLE `bus_location` (
  `location_id` int(11) NOT NULL,
  `bus_id` varchar(20) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `vi_tri_text` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `is_latest` tinyint(1) DEFAULT 0,
  `nearest_stop_id` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `bus_location`
--

INSERT INTO `bus_location` (`location_id`, `bus_id`, `latitude`, `longitude`, `vi_tri_text`, `timestamp`, `is_latest`, `nearest_stop_id`) VALUES
(1, 'XB1', NULL, NULL, 'Gần cổng trường THPT A', '2025-11-14 07:00:00', 1, NULL),
(2, 'XB2', NULL, NULL, 'Ngã tư Nguyễn Trãi - Lê Lợi', '2025-11-14 07:10:00', 1, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bus_schedule`
--

CREATE TABLE `bus_schedule` (
  `schedule_id` varchar(50) NOT NULL,
  `route_id` varchar(20) DEFAULT NULL,
  `bus_id` varchar(20) DEFAULT NULL,
  `driver_id` varchar(20) DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `bus_schedule`
--

INSERT INTO `bus_schedule` (`schedule_id`, `route_id`, `bus_id`, `driver_id`, `schedule_date`, `start_time`, `end_time`) VALUES
('LT1', 'TD1', 'XB1', 'TX001', '2025-11-28', '06:15:00', '07:45:00'),
('LT2', 'TD2', 'XB2', 'TX002', '2025-11-27', '06:45:00', '08:15:00'),
('XE001-01-11-2025', 'R01', 'XE001', 'TX003', '2025-11-01', '06:00:00', '07:15:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bus_status_history`
--

CREATE TABLE `bus_status_history` (
  `id` int(11) NOT NULL,
  `bus_id` varchar(20) NOT NULL,
  `status` enum('running','stopped','inactive') NOT NULL DEFAULT 'inactive',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `bus_status_history`
--

INSERT INTO `bus_status_history` (`id`, `bus_id`, `status`, `updated_at`) VALUES
(1, 'XB1', 'running', '2025-11-25 00:29:33'),
(2, 'XB2', 'stopped', '2025-11-25 00:29:33'),
(3, 'XB3', 'inactive', '2025-11-25 00:29:33');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bus_stop`
--

CREATE TABLE `bus_stop` (
  `stop_id` varchar(20) NOT NULL,
  `route_id` varchar(20) DEFAULT NULL,
  `stop_name` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `stop_order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `bus_stop`
--

INSERT INTO `bus_stop` (`stop_id`, `route_id`, `stop_name`, `address`, `stop_order`) VALUES
('STOP1', 'TD1', 'DHSG', '273 An Dương Vương', 1),
('STOP10', 'TD3', 'PT', 'Nhà thi đấu Phú Thọ', 2),
('STOP11', 'TD2', 'SVH', 'Sư Vạn Hạnh', 3),
('STOP12', 'TD1', 'BNR', 'Khu Di tích Bến Nhà Rồng', 3),
('STOP2', 'TD1', 'BVYD', 'Bệnh viện Đại học Y Dược TP.HCM', 2),
('STOP3', 'TD1', 'TCV', 'Thảo Cầm Viên', 5),
('STOP4', 'TD1', 'DHSG', '273 An Dương Vương', 6),
('STOP5', 'TD1', 'DHSG 2', 'Đại học Sài Gòn (cơ sở 2)', 4),
('STOP6', 'TD2', 'DHKHTN', 'Trường ĐH KHTN', 2),
('STOP7', 'TD3', 'Sư Vạn Hạnh', 'Sư Vạn Hạnh', 3),
('STOP8', 'TD3', 'NTP', 'Bệnh viện Nguyễn Tri Phương', 1),
('STOP_T1', 'R01', 'SGU Cổng Chính', '273 An Dương Vương', 1),
('STOP_T2', 'R01', 'Bệnh viện ĐH Y Dược', '215 Hồng Bàng', 2),
('STOP_T3', 'R01', 'SGU Cơ sở 2', 'Nguyễn Trãi', 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `driver`
--

CREATE TABLE `driver` (
  `driver_id` varchar(20) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('Nam','Nữ','Khác') DEFAULT NULL,
  `id_card` varchar(20) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 5.0,
  `status` varchar(50) DEFAULT 'Rảnh',
  `license_class` varchar(10) DEFAULT 'B2',
  `work_schedule` set('MON','TUE','WED','THU','FRI','SAT','SUN') DEFAULT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `driver`
--

INSERT INTO `driver` (`driver_id`, `user_id`, `name`, `phone`, `address`, `email`, `dob`, `gender`, `id_card`, `rating`, `status`, `license_class`, `work_schedule`, `profile_image`, `created_at`) VALUES
('TX001', 4, 'Nguyễn Văn Hùng', '0459276157', 'Lê Hồng Phong', 'hung.nguyen@gmail.com', '1985-03-15', 'Nam', '123456789012', 4.5, 'Rảnh', 'B2', 'MON,TUE,WED,FRI,SAT', NULL, '2025-11-01 08:00:00'),
('TX002', 5, 'Trần Văn Trí', '0745128698', 'Trần Xuân Soạn', 'tri.tran@gmail.com', '1988-07-22', 'Nam', '234567890123', 4.8, 'Rảnh', 'B2', 'MON,TUE,WED,THU,FRI', NULL, '2025-11-01 08:30:00'),
('TX003', 6, 'Lê Hùng Dũng', '0789425698', 'Võ Văn Kiệt', 'dung.le@gmail.com', '1990-12-10', 'Nam', '345678901234', 4.2, 'Rảnh', 'B2', 'TUE,WED,THU,FRI,SAT', NULL, '2025-11-01 09:00:00'),
('TX004', 7, 'Phạm Anh Đức', '0785158496', 'Nguyễn Trãi', 'duc.pham@gmail.com', '1987-05-08', 'Nam', '456789012345', 4.9, 'Đang hoạt động', 'B2', 'TUE,WED,THU,FRI', NULL, '2025-11-01 09:30:00'),
('TX005', 8, 'Ngô Thị Minh Thi', '0978425987', 'Đức Trọng', 'thi.ngo@gmail.com', '1992-09-18', 'Nữ', '567890123456', 4.7, 'Nghỉ phép', 'B2', 'MON,TUE,WED,THU,FRI,SAT,SUN', NULL, '2025-11-01 10:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `recipient_type` enum('bus','driver','parent','system') NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` enum('manual','scheduled') DEFAULT 'manual',
  `scheduled_time` datetime DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurrence_days` varchar(50) DEFAULT NULL,
  `status_sent` enum('pending','sent') DEFAULT 'sent',
  `created_at` datetime DEFAULT current_timestamp(),
  `status` enum('unread','read') NOT NULL DEFAULT 'unread'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `notification`
--

INSERT INTO `notification` (`id`, `recipient_type`, `title`, `content`, `type`, `scheduled_time`, `is_recurring`, `recurrence_days`, `status_sent`, `created_at`, `status`) VALUES
(1, 'driver', 'Thông báo cho tài xế', 'Ngày mai đi sớm 15 phút.', 'manual', NULL, 0, NULL, 'sent', '2025-11-17 00:35:46', 'read'),
(2, 'parent', 'Thông báo cho phụ huynh', 'Ngày mai trời mưa, chuẩn bị áo mưa cho bé.', 'manual', NULL, 0, NULL, 'sent', '2025-11-17 00:35:46', 'unread'),
(3, 'bus', 'Thông báo cho xe buýt', 'Xe BUS001 đi kiểm tra định kỳ.', 'manual', NULL, 0, NULL, 'sent', '2025-11-17 00:35:46', 'read'),
(4, 'driver', 'Nghi ngay mai', 'ngay mai mua nen nghi', 'manual', NULL, 0, NULL, 'sent', '2025-11-17 01:00:28', 'read'),
(5, 'driver', 'Dời thời gian khởi hành', 'Vì xe đang trong quá trình bảo dưỡng, giờ khởi hành sẽ bị lùi 30p.', 'manual', NULL, 0, NULL, 'sent', '2025-11-20 21:49:29', 'unread'),
(6, 'driver', 'Kiểm tra lịch làm', 'Kiểm tra lịch làm', 'scheduled', '2025-11-30 08:00:00', 1, '0', 'pending', '2025-11-20 21:51:49', 'read');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notification_recipients`
--

CREATE TABLE `notification_recipients` (
  `id` int(11) NOT NULL,
  `notification_id` int(11) NOT NULL,
  `recipient_id` varchar(20) NOT NULL,
  `recipient_type` varchar(50) DEFAULT NULL,
  `status` enum('unread','read') DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `notification_recipients`
--

INSERT INTO `notification_recipients` (`id`, `notification_id`, `recipient_id`, `recipient_type`, `status`, `created_at`) VALUES
(1, 5, 'TX005', 'driver', 'unread', '2025-11-20 07:49:29'),
(2, 6, 'TX001', 'driver', 'unread', '2025-11-23 08:41:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `parent`
--

CREATE TABLE `parent` (
  `parent_id` varchar(20) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `age` int(11) DEFAULT NULL COMMENT 'Tuổi',
  `sex` enum('Nam','Nữ','Khác') DEFAULT 'Khác',
  `email` varchar(255) DEFAULT 'Chưa nhập'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `parent`
--

INSERT INTO `parent` (`parent_id`, `user_id`, `name`, `phone`, `age`, `sex`, `email`) VALUES
('PH001', 9, 'Nguyễn Ngọc Lan', '0964123534', 30, 'Nữ', 'lannguyen@gmail.com'),
('PH002', 10, 'Trần Hữu Phát', '0987123765', 32, 'Nam', 'phattran@gmail.com'),
('PH003', 11, 'Hà Mỹ Hằng', '0901234567', 30, 'Nữ', 'hang@gmail.com'),
('PH004', 12, 'Tạ Minh Thi', '0912345678', 30, 'Nữ', 'thi@gmail.com');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `route`
--

CREATE TABLE `route` (
  `route_id` varchar(20) NOT NULL,
  `route_name` varchar(100) DEFAULT NULL,
  `start_point` varchar(150) DEFAULT NULL,
  `end_point` varchar(150) DEFAULT NULL,
  `planned_start` time DEFAULT NULL,
  `planned_end` time DEFAULT NULL,
  `total_students` int(11) DEFAULT 0,
  `status` enum('Đang hoạt động','Ngưng hoạt động','Bảo trì') DEFAULT 'Đang hoạt động',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `route`
--

INSERT INTO `route` (`route_id`, `route_name`, `start_point`, `end_point`, `planned_start`, `planned_end`, `total_students`, `status`, `created_at`) VALUES
('R01', 'SGU CSC -> SGU CS2', 'SGU_CSC', 'SGU_CS2', '06:00:00', '07:30:00', 15, 'Đang hoạt động', '2025-10-01 08:00:00'),
('TD1', 'Tuyến 1', 'Trường THPT A', 'Khu dân cư Hưng Phú', '06:15:00', '07:45:00', 20, 'Đang hoạt động', '2025-10-01 09:30:00'),
('TD2', 'Tuyến 2', 'Trường Tiểu học B', 'Khu phố An Lạc', '06:45:00', '08:15:00', 18, 'Đang hoạt động', '2025-10-01 10:00:00'),
('TD3', 'Tuyến 3', 'A', 'B', '07:15:00', '08:45:00', 10, 'Ngưng hoạt động', '2025-10-01 10:30:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `student`
--

CREATE TABLE `student` (
  `student_id` varchar(20) NOT NULL,
  `parent_id` varchar(20) DEFAULT NULL,
  `stop_id` varchar(20) DEFAULT NULL,
  `dropoff_stop_id` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `school_name` varchar(150) DEFAULT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `gender` enum('Nam','Nữ','Khác') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `student`
--

INSERT INTO `student` (`student_id`, `parent_id`, `stop_id`, `dropoff_stop_id`, `name`, `school_name`, `class_name`, `gender`) VALUES
('HS001', 'PH003', 'STOP1', 'STOP2', 'Nguyễn Văn An', 'Trường Tiểu học Nguyễn Trãi', '5A1', 'Nam'),
('HS002', 'PH004', 'STOP1', 'STOP2', 'Trần Thị Bình', 'Trường Tiểu học Lê Lợi', '4B2', 'Nữ'),
('HS17681', 'PH001', 'STOP_T1', 'STOP_T2', 'Nguyễn Minh Long', 'Trường THTH', '12C1', 'Nam');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `student_pickup`
--

CREATE TABLE `student_pickup` (
  `pickup_id` varchar(30) NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `driver_id` varchar(20) DEFAULT NULL,
  `schedule_id` varchar(50) DEFAULT NULL,
  `stop_id` varchar(20) DEFAULT NULL,
  `pickup_time` datetime DEFAULT NULL,
  `dropoff_time` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `student_pickup`
--

INSERT INTO `student_pickup` (`pickup_id`, `student_id`, `driver_id`, `schedule_id`, `stop_id`, `pickup_time`, `dropoff_time`, `status`) VALUES
('DT001', 'HS001', 'TX001', 'LT1', 'STOP1', '2025-11-14 06:35:00', '2025-11-14 07:25:00', 'DA_DON'),
('DT002', 'HS002', 'TX002', 'LT2', 'STOP1', NULL, NULL, 'CHO_DON');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','driver','parent') NOT NULL,
  `linked_id` varchar(20) DEFAULT NULL COMMENT 'ID liên kết với driver hoặc parent',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `role`, `linked_id`, `created_at`) VALUES
(1, 'admin', 'g5bus', 'admin', NULL, '2025-10-01 08:00:00'),
(2, 'driver', 'g5bus', 'driver', NULL, '2025-10-01 08:30:00'),
(3, 'parent', 'g5bus', 'parent', NULL, '2025-10-01 09:00:00'),
(4, 'tx001', '12345', 'driver', NULL, '2025-12-02 06:53:37'),
(5, 'tx002', '12345', 'driver', NULL, '2025-12-02 06:53:37'),
(6, 'tx003', '12345', 'driver', NULL, '2025-12-02 06:53:37'),
(7, 'tx004', '12345', 'driver', NULL, '2025-12-02 06:53:37'),
(8, 'tx005', '12345', 'driver', NULL, '2025-12-02 06:53:37'),
(9, 'ph001', '12345', 'parent', NULL, '2025-12-02 06:53:37'),
(10, 'ph002', '12345', 'parent', NULL, '2025-12-02 06:53:37'),
(11, 'ph003', '12345', 'parent', NULL, '2025-12-02 06:53:37'),
(12, 'ph004', '12345', 'parent', NULL, '2025-12-02 06:53:37');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `bus`
--
ALTER TABLE `bus`
  ADD PRIMARY KEY (`bus_id`),
  ADD KEY `default_route_id` (`default_route_id`);

--
-- Chỉ mục cho bảng `bus_location`
--
ALTER TABLE `bus_location`
  ADD PRIMARY KEY (`location_id`),
  ADD KEY `bus_id` (`bus_id`),
  ADD KEY `nearest_stop_id` (`nearest_stop_id`);

--
-- Chỉ mục cho bảng `bus_schedule`
--
ALTER TABLE `bus_schedule`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `route_id` (`route_id`),
  ADD KEY `bus_id` (`bus_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Chỉ mục cho bảng `bus_status_history`
--
ALTER TABLE `bus_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bus_id` (`bus_id`);

--
-- Chỉ mục cho bảng `bus_stop`
--
ALTER TABLE `bus_stop`
  ADD PRIMARY KEY (`stop_id`),
  ADD KEY `route_id` (`route_id`);

--
-- Chỉ mục cho bảng `driver`
--
ALTER TABLE `driver`
  ADD PRIMARY KEY (`driver_id`),
  ADD UNIQUE KEY `id_card` (`id_card`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `notification_recipients`
--
ALTER TABLE `notification_recipients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_id` (`notification_id`);

--
-- Chỉ mục cho bảng `parent`
--
ALTER TABLE `parent`
  ADD PRIMARY KEY (`parent_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `route`
--
ALTER TABLE `route`
  ADD PRIMARY KEY (`route_id`);

--
-- Chỉ mục cho bảng `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`student_id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `stop_id` (`stop_id`),
  ADD KEY `dropoff_stop_id` (`dropoff_stop_id`);

--
-- Chỉ mục cho bảng `student_pickup`
--
ALTER TABLE `student_pickup`
  ADD PRIMARY KEY (`pickup_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `driver_id` (`driver_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `stop_id` (`stop_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `bus_location`
--
ALTER TABLE `bus_location`
  MODIFY `location_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `bus_status_history`
--
ALTER TABLE `bus_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `notification_recipients`
--
ALTER TABLE `notification_recipients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bus`
--
ALTER TABLE `bus`
  ADD CONSTRAINT `bus_ibfk_1` FOREIGN KEY (`default_route_id`) REFERENCES `route` (`route_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `bus_location`
--
ALTER TABLE `bus_location`
  ADD CONSTRAINT `bus_location_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `bus` (`bus_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bus_location_ibfk_2` FOREIGN KEY (`nearest_stop_id`) REFERENCES `bus_stop` (`stop_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `bus_schedule`
--
ALTER TABLE `bus_schedule`
  ADD CONSTRAINT `bus_schedule_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `route` (`route_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bus_schedule_ibfk_2` FOREIGN KEY (`bus_id`) REFERENCES `bus` (`bus_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bus_schedule_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `driver` (`driver_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `bus_status_history`
--
ALTER TABLE `bus_status_history`
  ADD CONSTRAINT `bus_status_history_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `bus` (`bus_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `bus_stop`
--
ALTER TABLE `bus_stop`
  ADD CONSTRAINT `bus_stop_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `route` (`route_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `driver`
--
ALTER TABLE `driver`
  ADD CONSTRAINT `driver_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `notification_recipients`
--
ALTER TABLE `notification_recipients`
  ADD CONSTRAINT `notification_recipients_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `notification` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `parent`
--
ALTER TABLE `parent`
  ADD CONSTRAINT `parent_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `student_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `parent` (`parent_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_ibfk_2` FOREIGN KEY (`stop_id`) REFERENCES `bus_stop` (`stop_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `student_ibfk_3` FOREIGN KEY (`dropoff_stop_id`) REFERENCES `bus_stop` (`stop_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `student_pickup`
--
ALTER TABLE `student_pickup`
  ADD CONSTRAINT `student_pickup_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_pickup_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `driver` (`driver_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `student_pickup_ibfk_3` FOREIGN KEY (`schedule_id`) REFERENCES `bus_schedule` (`schedule_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_pickup_ibfk_4` FOREIGN KEY (`stop_id`) REFERENCES `bus_stop` (`stop_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
