#!/bin/bash

# Load environmen variablesfrom .env fle if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

COMMAND=$1

case "$COMMAND" in
    types)
        # Generate Kysely types
        bunx kysely-codegen --out-file="./src/server/db/types.ts" --url="postgresql://$DB_USERNAME:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" --camel-case
        ;;
    status)
        liquibase --url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" --username="$DB_USERNAME" --password="$DB_PASSWORD" --changeLogFile="$DB_CHANGELOG" status
        ;;
    reset)
        liquibase --url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" --username="$DB_USERNAME" --password="$DB_PASSWORD" --changeLogFile="$DB_CHANGELOG" dropAll
        ;;
    update)
        liquibase --url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" --username="$DB_USERNAME" --password="$DB_PASSWORD" --changeLogFile="$DB_CHANGELOG" update
        ;;
    rollback)
        COUNT=$2
        liquibase --url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" --username="$DB_USERNAME" --password="$DB_PASSWORD" --changeLogFile="$DB_CHANGELOG" rollback-count --count="$COUNT"
        ;;
    *)
        echo "Usage: $0 {types|status|reset|update|rollback <count>}"
        exit 1
        ;;
esac
