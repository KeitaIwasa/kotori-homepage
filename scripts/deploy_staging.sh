#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUCKET="${STG_STATIC_BUCKET:-kotori-ai-stg-static-origin-215896857123-20260405}"
DISTRIBUTION_ID="${STG_CLOUDFRONT_DISTRIBUTION_ID:-}"
PROFILE="${AWS_PROFILE:-line-translate-bot}"

python3 "$ROOT/scripts/build_staging_site.py"

aws s3 sync "$ROOT/dist-stg/" "s3://$BUCKET/" \
  --delete \
  --exclude ".git/*" \
  --profile "$PROFILE"

if [[ -n "$DISTRIBUTION_ID" ]]; then
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths '/*' \
    --profile "$PROFILE"
fi
