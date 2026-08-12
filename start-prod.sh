#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
# Remove conflicting deploy config that wrangler auto-generates
rm -f "$ROOT/.wrangler/deploy/config.json"
cd "$ROOT/dist/server"
exec bun "$ROOT/node_modules/.bin/wrangler" dev --port 5000 --no-bundle --config wrangler.json
