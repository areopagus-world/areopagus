#!/usr/bin/env bash
# Prints what each fetched file holds: the entries of an archive, the first lines of a CSV,
# the columns of a Parquet file. Nothing is changed. Parquet needs the Python module duckdb.
#
#   scripts/data/describe.sh .data > .data/schemas/today.md
set -uo pipefail

dir="${1:?usage: describe.sh FOLDER}"

# The first two lines, ending with a line break even when the file has none.
sample() {
  head -c 6000 | head -n 2
  echo
}

echo "# What the fetched files hold"
find "$dir/raw" -type f | sort | while read -r file; do
  echo
  echo "## ${file#"$dir"/}"
  echo
  echo "$(wc -c <"$file") bytes"
  echo
  case "$file" in
    *.zip)
      unzip -Z1 "$file" | while read -r entry; do
        echo "- $entry"
        case "$entry" in
          *.csv | *.CSV | *.txt)
            echo
            echo '```'
            unzip -p "$file" "$entry" 2>/dev/null | sample
            echo '```'
            ;;
        esac
      done
      ;;
    *.csv.gz)
      echo '```'
      gzip -dc "$file" 2>/dev/null | sample
      echo '```'
      ;;
    *.csv)
      echo '```'
      sample <"$file"
      echo '```'
      ;;
    *.parquet)
      echo '```'
      python3 - "$file" <<'PY' || echo "the Python module duckdb is not installed"
import sys
import duckdb

path = sys.argv[1]
rows = duckdb.execute("SELECT count(*) FROM read_parquet(?)", [path]).fetchone()[0]
print(f"{rows} rows")
for name, kind, *_ in duckdb.execute("DESCRIBE SELECT * FROM read_parquet(?)", [path]).fetchall():
    print(f"{name}: {kind}")
PY
      echo '```'
      ;;
    *)
      echo "not described"
      ;;
  esac
done
exit 0
