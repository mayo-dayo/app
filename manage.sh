#!/bin/bash

VERSION="0.1"

usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  run [--name NAME] [--port PORT]    Create and run a container"
    echo "  invite [--name NAME] [--uses USES] [--perms PERMS]    Create an invite"
    echo ""
    echo "Run options:"
    echo "  --name NAME    Instance name (default: default)"
    echo "  --port PORT    Server port (default: 4321)"
    echo ""
    echo "Invite options:"
    echo "  --name NAME    Instance name (default: default)"
    echo "  --uses USES    Number of uses (optional)"
    echo "  --perms PERMS  Permissions (default: 0)"
    exit 1
}

generate_uuid() {
    local hex

    hex=$(od -An -N16 -tx1 /dev/urandom | tr -d ' \n')

    local p1=${hex:0:8}

    local p2=${hex:8:4}

    local p3="4${hex:13:3}" 

    local p4="8${hex:17:3}"

    local p5=${hex:20:12}

    echo "$p1-$p2-$p3-$p4-$p5"
}

get_volume_path() {
    local volume_name=$1

    docker volume inspect --format '{{ .Mountpoint }}' "$volume_name" 2>/dev/null
}

handle_run() {
    local NAME="default"

    local PORT=4321

    while [[ $# -gt 0 ]]; do
        case $1 in
            --name)
                NAME="$2"
                shift 2
                ;;
            --port)
                PORT="$2"
                shift 2
                ;;
            *)
                echo "Unknown option: $1"
                usage
                ;;
        esac
    done

    if ! docker info >/dev/null 2>&1; then
        echo "Error: docker daemon is not running"

        exit 1
    fi

    CONTAINER_NAME="mayo-${VERSION}-${NAME}-container"

    if ! docker create \
        --name "$CONTAINER_NAME" \
        --network host \
        --restart unless-stopped \
        -e "HOST=0.0.0.0" \
        -e "PORT=${PORT}" \
        -e "MAYO_DATA_PATH=/mayo/.data" \
        -v "mayo-${VERSION}-${NAME}-volume:/mayo/.data" \
        "ghcr.io/mayo-dayo/app:${VERSION}"; then
        echo "Error: failed to create container"

        exit 1
    fi

    if ! docker start "$CONTAINER_NAME"; then
        echo "Error: failed to start container"

        exit 1
    fi
}

handle_invite() {
    local NAME="default"

    local USES="null"

    local PERMS=0

    while [[ $# -gt 0 ]]; do
        case $1 in
            --name)
                NAME="$2"
                shift 2
                ;;
            --uses)
                USES="$2"
                shift 2
                ;;
            --perms)
                PERMS="$2"
                shift 2
                ;;
            *)
                echo "Unknown option: $1"
                usage
                ;;
        esac
    done

    VOLUME_NAME="mayo-${VERSION}-${NAME}-volume"

    VOLUME_PATH=$(get_volume_path "$VOLUME_NAME")

    if [ -z "$VOLUME_PATH" ]; then
        echo "Error: could not find volume for instance '$NAME'"

        exit 1
    fi

    DB_PATH="${VOLUME_PATH}/db.sqlite"

    if [ ! -f "$DB_PATH" ]; then
        echo "Error: cannot access the database at $DB_PATH"

        exit 1
    fi

    if ! command -v sqlite3 >/dev/null; then
        echo "Error: sqlite3 not found"

        exit 1
    fi

    ID=$(generate_uuid)

    if [ -z "$ID" ]; then
        echo "Error: failed to generate UUID"

        exit 1
    fi

    if ! sqlite3 "$DB_PATH" "INSERT INTO invites (id, uses, perms) VALUES ('$ID', $USES, $PERMS);"; then
        echo "Error: failed to insert invite into database"

        exit 1
    fi

    echo "$ID"
}

if [ $# -eq 0 ]; then
    usage
fi

COMMAND=$1

shift

case $COMMAND in
    run)
        handle_run "$@"
        ;;
    invite)
        handle_invite "$@"
        ;;
    -h|--help)
        usage
        ;;
    *)
        echo "Unknown command: $COMMAND"
        usage
        ;;
esac

exit 0
