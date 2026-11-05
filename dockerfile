# Sử dụng image Node.js chính thức
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy các file cấu hình package
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Copy toàn bộ mã nguồn vào container
COPY . .

# Chạy build kiểm tra lỗi (Bao gồm cả ESLint và kiểm tra biến)
ENV CI=true
RUN npm run build

# Stage sản xuất (Production Stage nhẹ hơn bằng Nginx - Tùy chọn)
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]