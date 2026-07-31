FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsup.config.ts ./
COPY src/ src/

RUN npm run build

# ---- runtime image ----
FROM node:22-alpine AS runtime

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV DATA_DIR=/data

VOLUME ["/data"]

CMD ["node", "dist/mcp.js"]
