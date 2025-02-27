default: sync fmt lint check test

fmt:
    dprint fmt

lint:
    bun run oxlint --fix --ignore-pattern=*.astro --allow=no-unused-vars --allow=no-import-assign

sync:
    bun run astro sync

check:
    bun run astro check --noSync

test:
    bun run vitest run

dev:
    bunx --bun astro dev

build: default
    docker build . -t ghcr.io/mayo-dayo/app:0.4
