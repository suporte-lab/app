--liquibase formatted sql
--changeset andre:user
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--changeset andre:session
CREATE TABLE session (
	id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user" (id),
	secret_hash BYTEA NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);