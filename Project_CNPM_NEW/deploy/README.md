# Triển khai G5BUS trên Windows IIS (mẫu)

## 1) Chuẩn bị prerequisite

Máy Windows Server chạy PowerShell **Administrator**, cài:

- IIS (Web-Server) + module quản trị IIS
- IIS URL Rewrite + ARR (reverse proxy)
- Node.js (kèm npm)
- MySQL client (`mysql` trong PATH)
- NSSM (để chạy backend Node.js như Windows Service ổn định)

> Lưu ý: IIS **không tự chạy** backend Node.js nếu không có iisnode/handler tương ứng. Bộ mẫu này dùng kiến trúc: backend chạy service riêng, IIS reverse proxy `/api`.

## 2) Tạo file config triển khai

Sao chép file mẫu:

```powershell
Copy-Item .\deploy\iis.config.example.json .\deploy\iis.config.json
```

Chỉnh các giá trị trong `deploy/iis.config.json`:

- Tên IIS site/app pool
- Host name + port binding
- Đường dẫn deploy frontend/backend
- Port backend, DB host/user/password/name/port
- CORS origin
- `nssmPath`, `nodeExe`

> Bắt buộc đổi placeholder `__CHANGE_ME__` trước khi chạy production.

## 3) Chạy script triển khai

Dry-run (không ghi thay đổi):

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\install-iis.ps1 -ConfigPath .\deploy\iis.config.json -WhatIf
```

Thực thi thật:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\install-iis.ps1 -ConfigPath .\deploy\iis.config.json
```

Script sẽ:

- Check prerequisite và dừng với lỗi rõ ràng nếu thiếu
- `npm install` + `npm run build` frontend, copy vào thư mục IIS
- Copy backend, chạy `npm ci --omit=dev`
- Tạo `.env` backend từ config (không in password ra log)
- Tạo/cập nhật IIS site + app pool idempotent
- Tạo/cập nhật Windows Service backend bằng NSSM

## 4) Chạy seed SQL demo

Schema chính: `my-app/database/bus_map.sql`

Seed idempotent cho demo/local:

```powershell
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p < my-app\database\seed-demo.sql
```

Seed tạo dữ liệu tối thiểu: admin/driver/parent, route, bus, stop, student, schedule.

> Mật khẩu demo (`demo123`) chỉ để local/demo, không dùng production.

## 5) URL mẫu sau triển khai

- Frontend IIS: `http://g5bus.local/`
- API qua IIS reverse proxy: `http://g5bus.local/api/...`
- Backend service nội bộ: `http://127.0.0.1:5000`

Trước production cần rà soát lại binding, firewall, secret DB và tài khoản service.
