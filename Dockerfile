FROM oven/bun:1

WORKDIR /app

COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

COPY . .

ARG VITE_GOOGLE_MAPS_API_KEY

RUN bun run build

CMD ["bun", "run", "./.output/server/index.mjs"]
