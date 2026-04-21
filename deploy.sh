#!/usr/bin/env bash
# Deploy the image-proxy Cloudflare Worker.
#
# First-time setup:
#   1. Create a free Cloudflare account at https://dash.cloudflare.com/sign-up
#   2. Run: npx wrangler@latest login   (opens browser, one-time OAuth)
#   3. Run: ./deploy.sh
#   4. Copy the printed *.workers.dev URL into
#      src/lib/utils/image_proxy.js (IMAGE_PROXY constant).
#
# Subsequent deploys: just ./deploy.sh
set -euo pipefail
npx wrangler@latest deploy
