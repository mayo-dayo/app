FROM oven/bun:1-debian AS base

WORKDIR /mayo

FROM base AS build
COPY . .
RUN bun install --frozen-lockfile
RUN bunx --bun astro build

FROM base AS release
RUN apt update
RUN apt install wget xz-utils -y
RUN wget -O ffmpeg.tar.xz https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && \
    tar -xf ffmpeg.tar.xz && \
    DIR=$(ls -d ffmpeg-* | head -n 1) && \
    cp $DIR/ffmpeg /usr/bin/ && \
    cp $DIR/ffprobe /usr/bin/ && \
    rm -rf $DIR ffmpeg.tar.xz
COPY --from=build /mayo/dist/entry.js entry.js
COPY --from=build /mayo/dist/client client
# https://github.com/oven-sh/bun/issues/17454
RUN sed -i 's/var replace = ""/var { replace } = ""/g' entry.js

ENTRYPOINT ["bun", "run", "./entry.js"]
