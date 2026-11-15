#!/usr/bin/env bash
# Dumps the database, checks the dump, encrypts it and uploads it to object storage at a second provider.
#
# Needs: pg_dump and pg_restore at least as new as the server, age, aws.
# Environment:
#   BACKUP_DATABASE_URL    connection string of the database
#   BACKUP_AGE_RECIPIENT   age public key; only the matching private key, kept offline, can read a backup
#   BACKUP_S3_BUCKET       bucket name
#   BACKUP_S3_ENDPOINT     S3 endpoint, for example https://s3.fr-par.scw.cloud
#   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION
#   BACKUP_KEEP_DAYS       days a backup is kept (default 30)
#   BACKUP_DRY_RUN=1       stop before the upload (used to test the script)
set -euo pipefail

: "${BACKUP_DATABASE_URL:?}" "${BACKUP_AGE_RECIPIENT:?}"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
stamp="$(date -u +%Y-%m-%dT%H%MZ)"
dump="$work/areopagus-$stamp.dump"

# Everything is dumped, the settlements too: spaces and events point at them, and a restore
# without those rows cannot rebuild the links.
pg_dump --format=custom --no-owner --no-privileges --file="$dump" "$BACKUP_DATABASE_URL"

# A dump that cannot be listed, or that lacks the tables the network lives on, is not a backup.
listing="$(pg_restore --list "$dump")"
for table in users spaces events communities reports places schema_migrations; do
  if ! grep -Eq "TABLE DATA public $table( |$)" <<<"$listing"; then
    echo "backup refused: no data section for table $table" >&2
    exit 1
  fi
done
echo "dump ok: $(stat -c %s "$dump") bytes, $(grep -c 'TABLE DATA' <<<"$listing") tables with data"

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
