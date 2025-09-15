#!/bin/bash

# Set environment file (default to .env)
ENV_FILE=".env"

if [ -n "$ENV" ]; then
    ENV_FILE=".env.$ENV"
fi

# Load environment variables from file
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
else
    echo "Warning: Environment file '$ENV_FILE' not found."
fi

COMMAND=$1

case "$COMMAND" in
    types)
        bunx kysely-codegen \
            --out-file="./src/server/db/types.ts" \
            --url="postgresql://$DB_USERNAME:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" \
            --camel-case
        ;;
    status)
        liquibase \
            --url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" \
            --username="$DB_USERNAME" \
            --password="$DB_PASSWORD" \
            --changeLogFile="$DB_CHANGELOG" \
            status
        ;;
    reset)
        liquibase \
            --url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" \
            --username="$DB_USERNAME" \
            --password="$DB_PASSWORD" \
            --changeLogFile="$DB_CHANGELOG" \
            dropAll
        ;;
    update)
        liquibase \
            --url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" \
            --username="$DB_USERNAME" \
            --password="$DB_PASSWORD" \
            --changeLogFile="$DB_CHANGELOG" \
            update
        ;;
    rollback)
        COUNT=$2
        if [ -z "$COUNT" ]; then
            echo "Usage: $0 rollback <count>"
            exit 1
        fi
        liquibase \
            --url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" \
            --username="$DB_USERNAME" \
            --password="$DB_PASSWORD" \
            --changeLogFile="$DB_CHANGELOG" \
            rollback-count --count="$COUNT"
        ;;
    *)
        echo "Usage: $0 {types|status|reset|update|rollback <count>}"
        exit 1
        ;;
esac
