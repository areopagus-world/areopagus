-- The language a person reads the network in, used for the e-mails they get,
-- and whether they want e-mails about questions at all.
alter table users add column lang text not null default 'en' check (lang in ('en', 'fr', 'ru'));
alter table users add column notify boolean not null default true;
