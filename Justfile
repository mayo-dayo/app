default: sync fmt lint check

fmt:
    dprint fmt

lint:
    bun run oxlint --fix --ignore-pattern=*.astro --allow=no-unused-vars --allow=no-import-assign

sync:
    bun run astro sync

check:
    bun run astro check --noSync

dev: default
    bunx --bun astro dev

build: default
    docker build . -t ghcr.io/mayo-dayo/app:0.3
