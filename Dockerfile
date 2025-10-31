FROM oven/bun:1

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile || bun install

RUN cd frontend && (bun install --frozen-lockfile || bun install) && bun run build

EXPOSE 3000

CMD ["bun",  "start"]
