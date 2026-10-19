# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || pnpm install || yarn install
COPY . .
RUN npm run build || pnpm build || yarn build || true

FROM node:20-alpine

COPY --from=builder /app /app

USER node

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["node", "server.js"]
