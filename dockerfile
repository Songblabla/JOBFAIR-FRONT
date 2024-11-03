FROM oven/bun:1

WORKDIR /app

COPY . .

RUN bun install
RUN bun run build

ENV NEXT_TELEMETRY_DISABLED=1

ARG PORT=3000
ENV PORT=${PORT}

EXPOSE ${PORT}

CMD ["bun", "start"]