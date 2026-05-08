# ── Stage 1: Build Angular app ────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: API server (lightweight, no Angular build) ───────────────────────
FROM node:22-alpine AS api
WORKDIR /app

COPY api/server.js ./

EXPOSE 3000
CMD ["node", "server.js"]

# ── Stage 3: Nginx serving Angular static files ───────────────────────────────
FROM nginx:alpine AS web

COPY --from=builder /app/dist/reform/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
