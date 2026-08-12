#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/dist/server"
exec bun "$ROOT/node_modules/.bin/wrangler" dev \
  --port 5000 \
  --no-bundle \
  --config wrangler.json
