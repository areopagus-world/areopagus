# Open data

Public statistics about places are fetched as published and kept unchanged in object storage. The
decision and its reasons are in [ADR 0011](../adr/0011-open-data-raw-layer.md).

## What is fetched

The list is [`data/sources.json`](../../data/sources.json): for each source its publisher, licence,
the attribution the publisher asks for, the page it is described on, and its files. `caution` holds
what the publisher warns about, such as editions that cannot be compared.

To add a source, add an entry and open a pull request. The tests refuse a catalog with a missing
licence or attribution, a file name that is not plain, or a host that is not a known publisher
(`ALLOWED_HOSTS` in `scripts/data/catalog.mjs`).

## Where it goes

| In the bucket            | What                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `raw/SOURCE/HASH12-NAME` | the file, byte for byte; `HASH12` starts its SHA-256       |
| `manifests/DATE.json`    | one per run: every file with its address, size, hash, date |
| `schemas/DATE.md`        | one per run: archive entries, first lines, Parquet columns |

A file that has not changed lands on the same name and is not uploaded again. A changed file gets
a new name; the old one stays.

## Setting up, once

| Where           | Name                 | Value                                               |
| --------------- | -------------------- | --------------------------------------------------- |
| GitHub variable | `DATA_S3_BUCKET`     | bucket name; the workflow is off while it is empty  |
| GitHub variable | `DATA_S3_ENDPOINT`   | optional, default `https://s3.fr-par.scw.cloud`     |
| GitHub variable | `DATA_S3_REGION`     | optional, default `fr-par`                          |
| GitHub secret   | `DATA_S3_ACCESS_KEY` | optional; without it the key of the backups is used |
| GitHub secret   | `DATA_S3_SECRET_KEY` | optional; without it the key of the backups is used |

The bucket is private. Nothing in it is secret, but nobody else needs to pay for our downloads.

## Running

Actions, **data**, **Run workflow**. Leave the field empty to fetch everything, or give the id of
one source. The run's summary shows what each file holds. A file that could not be fetched makes
the run fail; the files that did arrive are still uploaded and the manifest lists the failure.

Locally:

```
node scripts/data/fetch.mjs --out .data
scripts/data/describe.sh .data
```

## Reading a file back

```
aws --endpoint-url https://s3.fr-par.scw.cloud s3 ls --recursive s3://BUCKET/raw/
aws --endpoint-url https://s3.fr-par.scw.cloud s3 cp s3://BUCKET/manifests/DATE.json -
```
