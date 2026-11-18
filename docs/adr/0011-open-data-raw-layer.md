# 0011. Open data is fetched outside the app and kept unchanged

- Status: Accepted
- Date: 2026-11-18

## Context

The Earth balance needs public statistics about places: incomes on the 200 m grid, the census by
neighbourhood, housing, schools, recorded crime, rents. The files are large, from tens to hundreds
of megabytes, and the app runs with a small memory limit; importing a 3 MB JSON file already broke
two deployments. A slice of a place must say where each number came from and must be reproducible
later, when the publisher has replaced the file. Publishers also warn that some editions cannot be
compared with one another, so we need to know exactly which edition a number was read from.

## Decision

Open data is fetched by a workflow started by hand, outside the app, from the sources listed in
`data/sources.json`. Each file is kept exactly as published in object storage, under a name that
carries its SHA-256, with a manifest of every run: source, licence, attribution, address, size,
hash and date. Nothing is unpacked, filtered or corrected in this layer. Derived tables and map
tiles are built from it in later steps, and only those results reach the app.

## Consequences

- A number in a slice can point at one file by its hash; the file is still there when the
  publisher moves on.
- The catalog is the single list of what we use, with the licence and the words of attribution
  each publisher asks for. A source enters by pull request.
- The app's memory and build are untouched by the size of the data.
- The catalog may only point at known publishers; a new host is a change to the code, on purpose.
- Storage grows with every changed edition. At today's sizes this is well under a gigabyte.
- No personal data is involved: these are published aggregates about places.

## Alternatives considered

- **Download inside the app or at build time.** Lost: the memory limit, and builds that depend on
  other people's servers.
- **Keep the files in the repository.** Lost: hundreds of megabytes of binary files in git.
- **Keep only the filtered extract for one city.** Lost: the extract cannot be checked against the
  source, and the next port would need the whole file again.
