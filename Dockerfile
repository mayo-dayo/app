FROM oven/bun:1-debian AS base

WORKDIR /mayo

FROM base AS build

COPY . .

RUN bun install --frozen-lockfile

RUN bunx --bun astro build

FROM base AS release

RUN apt update

RUN apt install ffmpeg -y

COPY --from=build /mayo/node_modules node_modules

COPY --from=build /mayo/dist dist

ENTRYPOINT ["bun", "run", "dist/server/entry.mjs"]
