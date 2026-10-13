-- Demo seed cho môi trường local/demo của G5BUS
-- KHÔNG dùng mật khẩu này cho production.

CREATE DATABASE IF NOT EXISTS `bus_map`;
USE `bus_map`;

START TRANSACTION;

INSERT INTO `users` (`user_id`, `username`, `password`, `role`, `linked_id`, `created_at`) VALUES
  (9001, 'admin_demo', 'demo123', 'admin', NULL, NOW()),
  (9002, 'driver_demo', 'demo123', 'driver', 'DRV_DEMO_01', NOW()),
  (9003, 'parent_demo', 'demo123', 'parent', 'PAR_DEMO_01', NOW())
ON DUPLICATE KEY UPDATE
  `password` = VALUES(`password`),
  `role` = VALUES(`role`),
  `linked_id` = VALUES(`linked_id`);

INSERT INTO `route` (`route_id`, `route_name`, `start_point`, `end_point`, `planned_start`, `planned_end`, `total_students`, `status`) VALUES
  ('ROUTE_DEMO_01', 'Tuyến Demo Quận 5', 'ĐH Sài Gòn', 'Khu dân cư Demo', '06:30:00', '07:30:00', 1, 'Đang hoạt động')
ON DUPLICATE KEY UPDATE
  `route_name` = VALUES(`route_name`),
  `start_point` = VALUES(`start_point`),
  `end_point` = VALUES(`end_point`),
  `planned_start` = VALUES(`planned_start`),
  `planned_end` = VALUES(`planned_end`),
  `status` = VALUES(`status`);

INSERT INTO `bus` (`bus_id`, `license_plate`, `capacity`, `default_route_id`, `status`, `departure_status`, `registry`) VALUES
  ('BUS_DEMO_01', '51B-12345', 16, 'ROUTE_DEMO_01', 'Đang hoạt động', 'Chưa xuất phát', CURDATE())
ON DUPLICATE KEY UPDATE
  `license_plate` = VALUES(`license_plate`),
  `capacity` = VALUES(`capacity`),
  `default_route_id` = VALUES(`default_route_id`),
  `status` = VALUES(`status`),
  `departure_status` = VALUES(`departure_status`),
  `registry` = VALUES(`registry`);

INSERT INTO `bus_stop` (`stop_id`, `route_id`, `stop_name`, `address`, `stop_order`) VALUES
  ('STOP_DEMO_01', 'ROUTE_DEMO_01', 'Điểm đón Demo', '273 An Dương Vương, Quận 5', 1),
  ('STOP_DEMO_02', 'ROUTE_DEMO_01', 'Điểm trả Demo', '215 Hồng Bàng, Quận 5', 2)
ON DUPLICATE KEY UPDATE
  `route_id` = VALUES(`route_id`),
  `stop_name` = VALUES(`stop_name`),
  `address` = VALUES(`address`),
  `stop_order` = VALUES(`stop_order`);

INSERT INTO `driver` (`driver_id`, `user_id`, `name`, `phone`, `address`, `email`, `dob`, `gender`, `id_card`, `rating`, `status`, `license_class`, `work_schedule`) VALUES
  ('DRV_DEMO_01', 9002, 'Tài xế Demo', '0909000001', 'Quận 5, TP.HCM', 'driver.demo@g5bus.local', '1990-01-01', 'Nam', '990000000001', 5.0, 'Đang hoạt động', 'B2', 'MON,TUE,WED,THU,FRI')
ON DUPLICATE KEY UPDATE
  `user_id` = VALUES(`user_id`),
  `name` = VALUES(`name`),
  `phone` = VALUES(`phone`),
  `address` = VALUES(`address`),
  `email` = VALUES(`email`),
  `dob` = VALUES(`dob`),
  `gender` = VALUES(`gender`),
  `id_card` = VALUES(`id_card`),
  `status` = VALUES(`status`),
  `license_class` = VALUES(`license_class`),
  `work_schedule` = VALUES(`work_schedule`);

INSERT INTO `parent` (`parent_id`, `user_id`, `name`, `phone`, `age`, `sex`, `email`) VALUES
  ('PAR_DEMO_01', 9003, 'Phụ huynh Demo', '0909000002', 35, 'Nữ', 'parent.demo@g5bus.local')
ON DUPLICATE KEY UPDATE
  `user_id` = VALUES(`user_id`),
  `name` = VALUES(`name`),
  `phone` = VALUES(`phone`),
  `age` = VALUES(`age`),
  `sex` = VALUES(`sex`),
  `email` = VALUES(`email`);

INSERT INTO `student` (`student_id`, `parent_id`, `stop_id`, `dropoff_stop_id`, `name`, `school_name`, `class_name`, `gender`) VALUES
  ('STD_DEMO_01', 'PAR_DEMO_01', 'STOP_DEMO_01', 'STOP_DEMO_02', 'Học sinh Demo', 'THPT Demo', '10A1', 'Nam')
ON DUPLICATE KEY UPDATE
  `parent_id` = VALUES(`parent_id`),
  `stop_id` = VALUES(`stop_id`),
  `dropoff_stop_id` = VALUES(`dropoff_stop_id`),
  `name` = VALUES(`name`),
  `school_name` = VALUES(`school_name`),
  `class_name` = VALUES(`class_name`),
  `gender` = VALUES(`gender`);

INSERT INTO `bus_schedule` (`schedule_id`, `route_id`, `bus_id`, `driver_id`, `schedule_date`, `start_time`, `end_time`) VALUES
  ('SCH_DEMO_01', 'ROUTE_DEMO_01', 'BUS_DEMO_01', 'DRV_DEMO_01', CURDATE(), '06:30:00', '07:30:00')
ON DUPLICATE KEY UPDATE
  `route_id` = VALUES(`route_id`),
  `bus_id` = VALUES(`bus_id`),
  `driver_id` = VALUES(`driver_id`),
  `schedule_date` = VALUES(`schedule_date`),
  `start_time` = VALUES(`start_time`),
  `end_time` = VALUES(`end_time`);

COMMIT;
