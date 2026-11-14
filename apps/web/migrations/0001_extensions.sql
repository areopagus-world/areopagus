-- Extensions the data model relies on: places (PostGIS), search by meaning (pgvector),
-- case-insensitive handles and e-mails (citext).
create extension if not exists postgis;
create extension if not exists vector;
create extension if not exists citext;
