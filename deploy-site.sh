#!/usr/bin/env bash
# Build and deploy the static site to the Davidson/inkandbolts FTP server
# over explicit FTPS. Mirrors what .github/workflows/main.yml does, but from
# a residential IP that isn't subject to the server's block on GitHub
# Actions runner IPs.
#
# Setup:
#   brew install lftp
#   # ensure .env exists with FTP_USERNAME, FTP_PASSWORD, FTP_SERVER, FTP_PORT
#
# Run:
#   ./deploy-site.sh
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
	echo "error: .env not found — copy credentials from 1Password / Jacob's message." >&2
	exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

: "${FTP_USERNAME:?FTP_USERNAME not set in .env}"
: "${FTP_PASSWORD:?FTP_PASSWORD not set in .env}"
FTP_SERVER="${FTP_SERVER:-ftp.inkandbolts.com}"
FTP_PORT="${FTP_PORT:-21}"

if ! command -v lftp >/dev/null 2>&1; then
	echo "error: lftp is required. Install with: brew install lftp" >&2
	exit 1
fi

echo "==> Building site..."
npm run build

echo "==> Deploying build/ to $FTP_SERVER:$FTP_PORT via FTPS..."
lftp -c "
	set ftp:ssl-force true;
	set ftp:ssl-protect-data true;
	set ssl:verify-certificate no;
	open -u '$FTP_USERNAME','$FTP_PASSWORD' -p $FTP_PORT '$FTP_SERVER';
	mirror --reverse --delete --verbose --parallel=4 --exclude-glob '.ftp*' ./build/ /;
"

echo "==> Done. Live at https://digitalprojects.davidson.edu/scrollytellerdh/"
