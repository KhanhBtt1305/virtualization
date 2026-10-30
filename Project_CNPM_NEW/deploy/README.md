# Triển khai G5BUS trên Windows IIS (mẫu)

## Triển khai frontend và backend lên Vercel

Frontend và backend là **hai Vercel project riêng**. Đặt Root Directory lần lượt là `Project_CNPM_NEW/my-app` (frontend) và `Project_CNPM_NEW/backend` (backend).

1. Ở Vercel project **frontend**, đặt biến môi trường `REACT_APP_API_URL=https://virtualization-pi.vercel.app/api` cho Production (và Preview nếu cần). Giá trị mặc định trong frontend cũng trỏ tới URL này; biến môi trường dùng để đổi backend khi cần. CRA đóng gói biến này lúc build.
2. Ở Vercel project **backend**, đặt các biến môi trường sau:

   | Biến | Giá trị |
   | --- | --- |
   | `CORS_ORIGIN` | Origin frontend, ví dụ `https://<frontend>.vercel.app` (nhiều origin cách nhau bằng dấu phẩy) |
   | `DB_HOST` | Host MySQL công khai của bạn |
   | `DB_PORT` | Port MySQL của nhà cung cấp |
   | `DB_USER` | Tài khoản MySQL |
   | `DB_PASSWORD` | Mật khẩu MySQL |
   | `DB_NAME` | Tên database |

Không dùng `localhost`, `db` của Docker hoặc `DB_PORT_HOST` cho `DB_HOST`/`DB_PORT` trên Vercel. Vercel cần truy cập được database qua mạng; database phải cho phép kết nối từ ứng dụng Vercel.
3. Redeploy cả hai project sau khi đổi Root Directory hoặc Environment Variables. File `.env.example` trong repository không tự trở thành Environment Variables của Vercel.
4. Kiểm tra `https://virtualization-pi.vercel.app/api/health`; kết quả mong đợi là `{"status":"ok"}`. Sau đó có thể kiểm tra lịch bằng `GET https://virtualization-pi.vercel.app/api/schedules?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`.

Không đưa mật khẩu database vào Git hoặc vào biến `REACT_APP_*`; những biến có tiền tố này được đóng gói vào frontend.

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

## 6) CI/CD (GitHub Actions)

Pipeline nằm ở `.github/workflows/ci-cd.yml`.

**CI** (mọi pull request và push vào `main`):

- Backend: `npm ci` + `npm test` (`GET /health`)
- Frontend: `npm test` + `npm run build` (artifact `frontend-build`)
- Docker: build image backend/frontend

**CD** (push vào `main`):

- Đẩy image lên GitHub Container Registry:
  - `ghcr.io/<owner>/g5bus-backend`
  - `ghcr.io/<owner>/g5bus-frontend`
- Deploy SSH chỉ chạy khi repository variable `ENABLE_DEPLOY=true`

### Bật deploy tự động

1. Tạo GitHub Environment tên `production`
2. Repository variable: `ENABLE_DEPLOY` = `true`
3. Secrets:

| Secret | Ý nghĩa |
| --- | --- |
| `DEPLOY_HOST` | IP hoặc hostname máy chủ |
| `DEPLOY_USER` | User SSH |
| `DEPLOY_SSH_KEY` | Private key SSH (không passphrase, hoặc dùng key deploy) |
| `DEPLOY_PATH` | Thư mục chứa `docker-compose.prod.yml` trên server |
| `GHCR_PULL_TOKEN` | PAT `read:packages` nếu image GHCR là private |

4. Trên server, clone repo (hoặc copy `docker-compose.prod.yml` + SQL seed), tạo file `.env` từ `.env.example`, rồi đợi workflow pull image và `docker compose up`.

Package GHCR mặc định private. Vào GitHub Packages → image → Package settings → đổi visibility nếu muốn pull không cần token.
