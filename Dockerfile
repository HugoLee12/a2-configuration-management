# Một image dùng chung cho mọi service; container nào chạy service nào do
# `command` trong compose quyết định.
FROM node:24-alpine

WORKDIR /app

# Chép manifest trước, chép mã nguồn sau, để sửa mã không phải cài lại dependency.
COPY package.json package-lock.json ./
COPY services/link/package.json services/link/
COPY services/redirect/package.json services/redirect/
COPY services/stats/package.json services/stats/
RUN npm ci --omit=dev

COPY services/ services/

# Không đặt CMD: chạy service nào là do `command` trong compose.yaml quyết định.
USER node
