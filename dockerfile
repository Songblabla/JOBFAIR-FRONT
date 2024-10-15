FROM oven/bun:1

WORKDIR /app

COPY . .

RUN bun install

ENV NEXT_TELEMETRY_DISABLED=1
 
ARG PORT

EXPOSE ${PORT:-3000}
 
CMD ["bun", "dev"]