#!/bin/sh
set -e

# Check if data directory exists and has content
if [ ! -d "/app/data" ] || [ -z "$(ls -A /app/data)" ]; then
    echo "Initializing data directory..."
    mkdir -p /app/data
    # Add any initialization logic here
    # For example:
    # cp -n /app/default-data/* /app/data/
fi

# Execute the main command
exec "$@"