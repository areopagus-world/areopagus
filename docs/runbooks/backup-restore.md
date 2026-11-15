# Backups and how to restore one

## What happens every night

The `backup` workflow runs at 02:17 UTC. It dumps the PostgreSQL database with `pg_dump`,
checks that the dump lists the tables the network lives on, encrypts it with
[age](https://age-encryption.org) and uploads it to an object storage bucket at a second
provider, under `daily/`. Backups older than 30 days are removed by a bucket rule.

The dump is encrypted for one public key. The private key is not in GitHub, not on the
server and not in this repository: it is kept offline by the person responsible for the
network. Without it a backup cannot be read, by anyone, including the storage provider.

The dump holds everything, the settlements from GeoNames included: spaces and events point
at them, and a restore without those rows cannot rebuild the links.

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

You need the private key file, `age`, `aws` and PostgreSQL client tools at least as new as
the server.

```bash
# 1. Find and download a backup
aws --endpoint-url https://s3.fr-par.scw.cloud s3 ls s3://BUCKET/daily/
aws --endpoint-url https://s3.fr-par.scw.cloud s3 cp s3://BUCKET/daily/areopagus-DATE.dump.age .

# 2. Decrypt it with the private key
age --decrypt --identity /path/to/areopagus-backup.key --output areopagus.dump areopagus-DATE.dump.age

# 3. Restore into an empty database
pg_restore --no-owner --no-privileges --dbname "postgres://USER:PASSWORD@HOST:PORT/DATABASE" areopagus.dump

# 4. Start the app against that database: it applies any newer migration
```

## Restore drill

Once a month, restore the latest backup into a local empty database and check that the
number of spaces matches the live site. A backup that has never been restored is a hope,
not a backup. Write the date of the drill in the project's chronology.

## If the private key is lost

Old backups become unreadable. Generate a new key pair, put the new public key in
`BACKUP_AGE_RECIPIENT`, run the workflow by hand and check that a new backup appears.
