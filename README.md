# Virtualization - CI/CD

Tài liệu này mô tả quy trình CI/CD của dự án G5BUS trong thư mục
`Project_CNPM_NEW`.

## Tổng quan

CI/CD được triển khai bằng GitHub Actions tại
[`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml).

Quy trình gồm:

1. Kiểm thử backend.
2. Kiểm thử và build frontend.
3. Build Docker image cho backend và frontend.
4. Push image lên GitHub Container Registry (GHCR) khi code được push vào
   `main`.
5. Deploy lên máy chủ qua SSH nếu bật biến `ENABLE_DEPLOY`.

## Khi nào workflow chạy?

Workflow chạy trong các trường hợp:

- Pull Request có thay đổi trong `Project_CNPM_NEW/**`.
- Push vào nhánh `main` có thay đổi trong `Project_CNPM_NEW/**`.
- Thay đổi chính workflow CI/CD.
- Chạy thủ công bằng nút **Run workflow** trên GitHub Actions.

Các workflow cũ cùng nhóm sẽ bị hủy khi có workflow mới cho cùng branch hoặc
Pull Request. Điều này tránh chạy đồng thời nhiều phiên bản CI không còn cần
thiết.

## Các job trong CI

### 1. Backend

Job backend sử dụng Node.js 20 và thực hiện trong
`Project_CNPM_NEW/backend`:

```text
npm ci
npm test
```

Test backend hiện kiểm tra endpoint `GET /health`.

### 2. Frontend

Job frontend sử dụng Node.js 20, npm 11 và thực hiện trong
`Project_CNPM_NEW/my-app`:

```text
npm ci
npm test -- --watchAll=false
npm run build
```

Build output được lưu thành GitHub Actions artifact với tên
`frontend-build`.

### 3. Docker

Job Docker chỉ chạy sau khi cả backend và frontend thành công.

Hai image được build:

```text
ghcr.io/<github-owner>/g5bus-backend
ghcr.io/<github-owner>/g5bus-frontend
```

Mỗi image được gắn:

- tag theo commit SHA, dùng để truy vết phiên bản;
- tag `latest` khi workflow chạy trên `main`.

Trong Pull Request, image chỉ được build để kiểm tra và **không được push**.
Khi push vào `main`, image được push lên GHCR bằng `GITHUB_TOKEN`.

Docker BuildKit cache được lưu riêng cho backend và frontend để rút ngắn thời
gian build ở các lần chạy sau.

## CD và deploy production

Job deploy chỉ chạy khi đồng thời thỏa mãn:

- workflow không phải Pull Request;
- branch là `main`;
- repository variable `ENABLE_DEPLOY` có giá trị `true`;
- các job kiểm thử và build image đã thành công.

Deploy sử dụng:

- GitHub Environment: `production`;
- SSH tới máy chủ đích;
- file `docker-compose.prod.yml`;
- image backend/frontend đã publish trên GHCR.

File Compose production nằm tại
[`Project_CNPM_NEW/docker-compose.prod.yml`](./Project_CNPM_NEW/docker-compose.prod.yml).
File này chạy ba service:

- `db`: MySQL 8.0;
- `backend`: image backend từ GHCR;
- `frontend`: image frontend từ GHCR.

## Cấu hình GitHub Actions

### Repository variable

Vào **Settings → Secrets and variables → Actions → Variables** và tạo:

| Tên | Giá trị |
| --- | --- |
| `ENABLE_DEPLOY` | `true` để bật deploy tự động |

Để tắt deploy, đổi giá trị thành `false` hoặc xóa biến này.

### GitHub Environment

Tạo Environment tên chính xác là:

```text
production
```

Có thể cấu hình approval protection rule cho Environment này để yêu cầu
duyệt thủ công trước khi deploy production.

### Secrets

Tạo các secret cần thiết trong Environment `production` hoặc repository:

| Secret | Ý nghĩa |
| --- | --- |
| `DEPLOY_HOST` | IP hoặc hostname máy chủ |
| `DEPLOY_USER` | Tài khoản SSH |
| `DEPLOY_SSH_KEY` | Private SSH key dùng để đăng nhập |
| `DEPLOY_PATH` | Đường dẫn tới thư mục chứa `docker-compose.prod.yml` |
| `GHCR_PULL_TOKEN` | PAT có quyền `read:packages` nếu image GHCR private |

Private key chỉ được lưu trong GitHub Secrets, không commit vào repository.

## Chuẩn bị máy chủ deploy

Trên máy chủ cần cài:

- Docker Engine;
- Docker Compose plugin;
- SSH server;
- quyền để user deploy chạy Docker;
- thư mục triển khai chứa:
  - `docker-compose.prod.yml`;
  - thư mục `my-app/database` với các file SQL khởi tạo.

Tạo file `.env` trên máy chủ dựa trên
[`Project_CNPM_NEW/.env.example`](./Project_CNPM_NEW/.env.example):

```dotenv
DB_PASSWORD=mat-khau-thuc-te
DB_NAME=bus_map
DB_USER=root
DB_PORT_HOST=3307
BACKEND_PORT=5000
FRONTEND_PORT=3000
CORS_ORIGIN=https://example.com
BACKEND_IMAGE=ghcr.io/<github-owner>/g5bus-backend:latest
FRONTEND_IMAGE=ghcr.io/<github-owner>/g5bus-frontend:latest
```

Không sử dụng mật khẩu mặc định hoặc đưa file `.env` production vào Git.

Khi deploy, workflow thực hiện tương đương:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
docker compose -f docker-compose.prod.yml ps
```

## Chạy local bằng Docker

Từ thư mục `Project_CNPM_NEW`:

```bash
docker compose up --build
```

Các địa chỉ mặc định:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- MySQL từ host: `localhost:3307`

Dừng service:

```bash
docker compose down
```

Xóa cả volume MySQL và khởi tạo database lại:

```bash
docker compose down -v
```

## Kiểm tra workflow

Trước khi push, có thể chạy các lệnh tương đương CI trên máy local:

```bash
cd Project_CNPM_NEW/backend
npm ci
npm test

cd ../my-app
npm ci
npm test -- --watchAll=false
npm run build

cd ..
docker compose config
docker compose build
```

Nếu backend hoặc frontend test thất bại, job Docker và deploy sẽ không được
thực hiện.

## Lưu ý vận hành

- `latest` thuận tiện cho triển khai đơn giản; tag commit SHA phù hợp hơn cho
  rollback và audit production.
- GHCR package thường ở chế độ private. Khi đó máy chủ cần
  `GHCR_PULL_TOKEN` có quyền `read:packages`.
- Database sử dụng volume `mysql_data`, nên `docker compose down` không xóa dữ
  liệu. Chỉ `docker compose down -v` mới xóa volume.
- Nên bật approval protection cho Environment `production` trước khi sử dụng
  deploy tự động trên hệ thống thật.
