FROM oven/bun:1 AS base

FROM base AS deps
WORKDIR /app

COPY . .

RUN bun install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY .env.example .env

# RUN bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ARG PORT
EXPOSE ${PORT:-3000}

ENV PORT ${PORT:-3000}

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["bun", "dev"]