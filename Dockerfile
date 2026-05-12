# Stage 1: Build
FROM node:20-alpine AS builder
RUN npm install -g pnpm@9
WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma:generate
RUN pnpm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner
RUN npm install -g pnpm@9
WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/.npmrc ./
COPY --from=builder /app/prisma ./prisma

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# prisma CLI (migrate deploy에 필요)
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# 생성된 Prisma 클라이언트
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/dist ./dist
COPY docker/entrypoint.sh ./

EXPOSE 3000
CMD ["sh", "entrypoint.sh"]
