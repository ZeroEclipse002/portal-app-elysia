FROM oven/bun AS runtime
WORKDIR /app

COPY . .

RUN bun install --legacy-peer-deps
RUN bun run build

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD node ./dist/server/entry.mjs