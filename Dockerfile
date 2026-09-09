FROM node:20-alpine

# Error 1: gid 1000 conflict (Alpine already has gid 1000)
RUN addgroup --gid 1000 appuser && adduser --uid 1000 --gid 1000 appuser

WORKDIR /app

# Error 2: wrong lockfile + pnpm without auto-install-peers config
COPY package-lock.json ./
RUN pnpm install

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/healthz || exit 1

# Error 4: running as root (security issue)
CMD ["npm", "start"]
