FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY my-app/package*.json ./
RUN npm install --include=dev --no-audit --no-fund

COPY my-app/ ./

RUN npm run build

FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
