# Backups and how to restore one

## What happens every night

The `backup` workflow runs at 02:17 UTC. `apps/web/scripts/export-data.mjs` writes every row
of the database, in one consistent snapshot, to a gzip-compressed JSON lines file;
`import-data.mjs --check` reads the file back and refuses it if it is cut short, out of order
or missing a table the network lives on. The file is then encrypted with
[age](https://age-encryption.org) and uploaded to an object storage bucket at a second
provider, under `daily/`. Backups older than 30 days are removed by a bucket rule.

Why not `pg_dump`: the shared PostgreSQL plan does not let an ordinary role read
`pg_database`, and `pg_dump` cannot run without it. The export needs only the tables
themselves. The schema is not in the backup: it is `apps/web/migrations/`, and the backup
records which migrations it was made with.

Short-lived tables are left out: sign-in links, sessions and passkey challenges. After a
restore everyone signs in again.

The file is encrypted for one public key. The private key is not in GitHub, not on the
server and not in this repository: it is kept offline by the person responsible for the
network. Without it a backup cannot be read, by anyone, including the storage provider.

## Settings

| Where           | Name                   | What                                               |
| --------------- | ---------------------- | -------------------------------------------------- |
| GitHub secret   | `BACKUP_DATABASE_URL`  | connection string of the database                  |
| GitHub secret   | `BACKUP_S3_ACCESS_KEY` | access key of the storage                          |
| GitHub secret   | `BACKUP_S3_SECRET_KEY` | secret key of the storage                          |
| GitHub variable | `BACKUP_S3_BUCKET`     | bucket name; the workflow is off while it is empty |
| GitHub variable | `BACKUP_AGE_RECIPIENT` | age public key (`age1...`)                         |
| GitHub variable | `BACKUP_S3_ENDPOINT`   | optional, default `https://s3.fr-par.scw.cloud`    |
| GitHub variable | `BACKUP_S3_REGION`     | optional, default `fr-par`                         |

## Restore

You need the private key file, `age`, `aws`, Node and a checkout of this repository with
`pnpm install` done.

```bash
# 1. Find and download a backup
aws --endpoint-url https://s3.fr-par.scw.cloud s3 ls s3://BUCKET/daily/
aws --endpoint-url https://s3.fr-par.scw.cloud s3 cp s3://BUCKET/daily/areopagus-DATE.jsonl.gz.age .

# 2. Decrypt it and check it
age --decrypt --identity /path/to/areopagus-backup.key --output backup.jsonl.gz areopagus-DATE.jsonl.gz.age
cd apps/web
node scripts/import-data.mjs --check ../../backup.jsonl.gz
#    it prints the last migration the backup was made with, for example 0008

# 3. Check out the code at that migration, and build the schema on an EMPTY database
#    (migrate.mjs alone: "pnpm migrate" would also load the places, and the load needs empty tables)
export DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"
node scripts/migrate.mjs

# 4. Load the rows, all in one transaction
node scripts/import-data.mjs --file ../../backup.jsonl.gz

# 5. Point the app at that database and start it; newer migrations apply themselves
```

The load refuses a database whose migrations differ from the backup's or whose tables are
not empty, and changes nothing in that case.

## Restore drill

Once a month, restore the latest backup into a local empty database and check that the
number of spaces matches the live site. A backup that has never been restored is a hope,
not a backup. Write the date of the drill in the project's chronology.

## If the private key is lost

Old backups become unreadable. Generate a new key pair, put the new public key in
`BACKUP_AGE_RECIPIENT`, run the workflow by hand and check that a new backup appears.
