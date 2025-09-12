--liquibase formatted sql
--changeset andre:user
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
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

--changeset andre:municipality
CREATE TABLE municipality (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--rollback DROP TABLE municipality;

--changeset andre:project-category
CREATE TABLE project_category (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--rollback DROP TABLE project_category;

--changeset andre:project
CREATE TABLE project (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES project_category (id),
    municipality_id TEXT NOT NULL REFERENCES municipality (id),
    name TEXT NOT NULL,
    responsible_name TEXT,
    responsible_role TEXT,
    responsible_phone TEXT,
    responsible_email TEXT NOT NULL,
    address_street TEXT NOT NULL,
    address_number TEXT,
    address_zip_code TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--rollback DROP TABLE project;

--changeset andre:survey
CREATE TABLE IF NOT EXISTS survey (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research (
    id TEXT PRIMARY KEY,
    survey_id TEXT NOT NULL REFERENCES survey (id) ON DELETE CASCADE,
    municipality_id TEXT NOT NULL REFERENCES municipality (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_question (
    id TEXT PRIMARY KEY,
    survey_id TEXT NOT NULL REFERENCES survey (id) ON DELETE CASCADE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    question TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    position INT NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_question_metadata (
    id TEXT PRIMARY KEY,
    survey_question_id TEXT NOT NULL REFERENCES survey_question (id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    value TEXT,
    position INT NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_answer (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES project (id) ON DELETE CASCADE,
    research_id TEXT NOT NULL REFERENCES research (id) ON DELETE CASCADE,
    survey_id TEXT NOT NULL REFERENCES survey (id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES survey_question (id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--rollback DROP TABLE survey CASCADE;
--rollback DROP TABLE research CASCADE;
--rollback DROP TABLE survey_question CASCADE;
--rollback DROP TABLE survey_question_metadata CASCADE;
--rollback DROP TABLE survey_answer CASCADE;