FROM oven/bun:canary-alpine AS base
WORKDIR /mayo

FROM base AS ffmpeg
RUN apk add --no-cache wget xz
RUN wget -O ffmpeg.tar.xz https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && \
    tar -xf ffmpeg.tar.xz && \
    DIR=$(ls -d ffmpeg-* | head -n 1) && \
    mv $DIR/ffmpeg /usr/bin/ && \
    mv $DIR/ffprobe /usr/bin/ && \
    rm -rf $DIR ffmpeg.tar.xz

FROM base AS build
COPY . .
# https://github.com/oven-sh/bun/issues/16915
RUN apk add --no-cache libc6-compat
RUN bun install --frozen-lockfile --release
RUN bunx --bun astro build

FROM base AS release
WORKDIR /mayo
COPY --from=ffmpeg /usr/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=ffmpeg /usr/bin/ffprobe /usr/bin/ffprobe
COPY --from=build /mayo/dist/client client
COPY --from=build /mayo/dist/entry.js entry.js

ENTRYPOINT ["bun", "run", "./entry.js"]
