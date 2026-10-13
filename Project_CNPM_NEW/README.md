<<<<<<< HEAD
# Project_CNPM_NEW
web demo
Local host: http://localhost:5173/
my-app/
│
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       └── logo.png
│
├── src/
│   ├── assets/               # Ảnh, icon, font, v.v.
│   ├── components/           # Các component dùng chung (Button, Navbar, Modal, v.v.)
│   ├── pages/                # Các trang (Home, About, Contact, v.v.)
│   ├── layouts/              # Cấu trúc layout tổng thể (Header, Footer, Sidebar)
│   ├── routes/               # Cấu hình routing (react-router-dom)
│   ├── hooks/                # Custom hooks (useAuth, useFetch, ...)
│   ├── context/              # React Context (Global state, AuthContext, ThemeContext)
│   ├── services/             # Gọi API hoặc xử lý logic phía client (axios, fetch, ...)
│   ├── utils/                # Hàm tiện ích (formatDate, validateEmail, ...)
│   ├── App.jsx               # Thành phần gốc
│   ├── main.jsx              # Điểm khởi chạy (render React)
│   └── index.css             # CSS chung hoặc global
│
├── .gitignore
├── package.json
├── vite.config.js (hoặc webpack.config.js)
└── README.md

# Backend nodejs + express + mysql
npm install express cors mysql2 bcrypt
node server.js
# Frontend react
my-app>npm start

# Chạy toàn bộ hệ thống bằng Docker
docker compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MySQL từ máy host: localhost:3307
#
# Backend trong Docker kết nối MySQL qua db:3306.
#
# Lần đầu chạy, MySQL sẽ tự khởi tạo schema và dữ liệu demo.
# Dừng container:
docker compose down

# Xóa cả dữ liệu MySQL để khởi tạo lại từ đầu:
docker compose down -v


# Cấu trúc Sign in

React (Frontend)
 └─ App.js
     ├─ Signin.js (login form)
     ├─ Success.js (admin)
     ├─ DriverSuccess.js
     └─ ParentSuccess.js
      (Hiển thị theo loại user)
 └── package.json      <-- Quản lý thư viện frontend

NodeJS + Express (Backend)
 ├─ server.js (main server)
 ├─ signinRoute.js (route)
 ├─ signinController.js (logic xử lý)
 ├─ signinModel.js (tương tác DB)
 └─ db.js (kết nối MySQL)

MySQL (Database)
 └─ bảng tai_khoan
      ├─ id
      ├─ tenTK
      ├─ matkhau
      └─ loai (AD / DRIVER / PARENT)



# G5BUS - SQL tạo bảng và dữ liệu mẫu 
## 1. SQL tk ko mã hóa hash
-- Chọn cơ sở dữ liệu busmap
USE busmap;

CREATE TABLE IF NOT EXISTS tai_khoan (
    id VARCHAR(20) PRIMARY KEY,
    tenTK VARCHAR(50) NOT NULL UNIQUE,
    matkhau VARCHAR(255) NOT NULL,
    loai ENUM('AD', 'DRIVER', 'PARENT') NOT NULL
);

INSERT INTO tai_khoan (id, tenTK, matkhau, loai) VALUES
('1', 'admin', 'g5bus', 'AD'),
('2', 'driver', 'g5bus', 'DRIVER'),
('3', 'parent', 'g5bus', 'PARENT');
>>>>>>> tonghop
