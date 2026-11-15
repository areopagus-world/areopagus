#!/usr/bin/env bash
# Exports the database, checks the export, encrypts it and uploads it to object storage at a second provider.
#
# The export is made by apps/web/scripts/export-data.mjs, not pg_dump: the shared PostgreSQL plan
# does not let an ordinary role read pg_database, which pg_dump needs. The schema lives in migrations/.
#
# Needs: node with the app's dependencies installed, age, aws.
# Environment:
#   BACKUP_DATABASE_URL    connection string of the database
#   BACKUP_AGE_RECIPIENT   age public key; only the matching private key, kept offline, can read a backup
#   BACKUP_S3_BUCKET       bucket name
#   BACKUP_S3_ENDPOINT     S3 endpoint, for example https://s3.fr-par.scw.cloud
#   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION
#   BACKUP_KEEP_DAYS       days a backup is kept (default 30)
#   BACKUP_DRY_RUN=1       stop before the upload (used to test the script)
set -euo pipefail

# A pasted setting often brings a line break along; none of these may contain spaces.
trim() { printf '%s' "${1:-}" | tr -d '[:space:]'; }
BACKUP_DATABASE_URL="$(trim "${BACKUP_DATABASE_URL:-}")"
BACKUP_AGE_RECIPIENT="$(trim "${BACKUP_AGE_RECIPIENT:-}")"
BACKUP_S3_BUCKET="$(trim "${BACKUP_S3_BUCKET:-}")"
BACKUP_S3_ENDPOINT="$(trim "${BACKUP_S3_ENDPOINT:-}")"
export BACKUP_DATABASE_URL

: "${BACKUP_DATABASE_URL:?}" "${BACKUP_AGE_RECIPIENT:?}"
app="$(cd "$(dirname "$0")/../apps/web" && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
stamp="$(date -u +%Y-%m-%dT%H%MZ)"
dump="$work/areopagus-$stamp.jsonl.gz"

node "$app/scripts/export-data.mjs" --out "$dump"
# Read the file back before trusting it: complete, in order, with the tables the network lives on.
node "$app/scripts/import-data.mjs" --check "$dump"
echo "export: $(stat -c %s "$dump") bytes"

age --recipient "$BACKUP_AGE_RECIPIENT" --output "$dump.age" "$dump"
rm "$dump"
echo "encrypted: $(stat -c %s "$dump.age") bytes"

if [ "${BACKUP_DRY_RUN:-}" = "1" ]; then
  cp "$dump.age" "${BACKUP_DRY_RUN_OUT:-/dev/null}"
  echo "dry run: not uploaded"
  exit 0
fi

: "${BACKUP_S3_BUCKET:?}" "${BACKUP_S3_ENDPOINT:?}"
# Checksums the newer aws cli adds by default are not accepted by every S3-compatible storage.
export AWS_REQUEST_CHECKSUM_CALCULATION=when_required AWS_RESPONSE_CHECKSUM_VALIDATION=when_required
s3() { aws --endpoint-url "$BACKUP_S3_ENDPOINT" "$@"; }

s3 s3 cp "$dump.age" "s3://$BACKUP_S3_BUCKET/daily/$(basename "$dump.age")" --only-show-errors
s3 s3api put-bucket-lifecycle-configuration --bucket "$BACKUP_S3_BUCKET" --lifecycle-configuration "{
  \"Rules\": [{\"ID\": \"expire-daily\", \"Status\": \"Enabled\", \"Filter\": {\"Prefix\": \"daily/\"},
               \"Expiration\": {\"Days\": ${BACKUP_KEEP_DAYS:-30}}}]}"
echo "uploaded: daily/$(basename "$dump.age")"
echo "backups in the bucket: $(s3 s3 ls "s3://$BACKUP_S3_BUCKET/daily/" | wc -l)"
