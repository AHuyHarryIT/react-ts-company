#!/usr/bin/env bash
set -euo pipefail

NODE20_PATH="${GITNEXUS_NODE20_PATH:-}"
if [[ -z "$NODE20_PATH" ]]; then
  NODE20_PATH="$(npx -y -p node@20 which node </dev/null)"
fi

GITNEXUS_CLI="${GITNEXUS_CLI_PATH:-}"
if [[ -z "$GITNEXUS_CLI" ]]; then
  GITNEXUS_CLI="$(find "$HOME/.npm/_npx" -path '*/node_modules/gitnexus/dist/cli/index.js' -print -quit 2>/dev/null || true)"
fi

if [[ -z "$GITNEXUS_CLI" ]]; then
  npx -y gitnexus@latest --version >/dev/null </dev/null
  GITNEXUS_CLI="$(find "$HOME/.npm/_npx" -path '*/node_modules/gitnexus/dist/cli/index.js' -print -quit 2>/dev/null || true)"
fi

if [[ -z "$GITNEXUS_CLI" ]]; then
  echo "GitNexus CLI not found in npm cache" >&2
  exit 1
fi

exec "$NODE20_PATH" "$GITNEXUS_CLI" mcp
