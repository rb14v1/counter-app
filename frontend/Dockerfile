FROM node:20-alpine AS builder
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || pnpm install || yarn install
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules

RUN printf 'const http = require("http");\nconst fs = require("fs");\nconst path = require("path");\n\nconst PORT = process.env.PORT || 8080;\nconst HOST = process.env.HOSTNAME || "0.0.0.0";\n\nconst mimeTypes = {\n  ".html": "text/html",\n  ".js": "application/javascript",\n  ".css": "text/css",\n  ".json": "application/json",\n  ".png": "image/png",\n  ".jpg": "image/jpeg",\n  ".svg": "image/svg+xml",\n  ".ico": "image/x-icon"\n};\n\nconst server = http.createServer((req, res) => {\n  if (req.url === "/healthz") {\n    res.writeHead(200, { "Content-Type": "text/plain" });\n    res.end("OK");\n    return;\n  }\n\n  let filePath = path.join(__dirname, "dist", req.url === "/" ? "index.html" : req.url);\n  const ext = path.extname(filePath);\n\n  fs.access(filePath, fs.constants.F_OK, (err) => {\n    if (err || !ext) {\n      filePath = path.join(__dirname, "dist", "index.html");\n    }\n    fs.readFile(filePath, (err, content) => {\n      if (err) {\n        res.writeHead(500);\n        res.end("Error loading file");\n        return;\n      }\n      const contentType = mimeTypes[path.extname(filePath)] || "application/octet-stream";\n      res.writeHead(200, { "Content-Type": contentType });\n      res.end(content);\n    });\n  });\n});\n\nserver.listen(PORT, HOST, () => {\n  console.log(`Server running at http://${HOST}:${PORT}/`);\n});\n' > /app/server.js

USER node

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["node", "/app/server.js"]
