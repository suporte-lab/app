import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // user
  await db.schema
    .createTable('user')
    .ifNotExists()
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('nickname', 'text', col => col.notNull().unique())
    .addColumn('email', 'text', col => col.unique())
    .addColumn('email_verified', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('password', 'text', col => col.notNull())
    .addColumn('role', 'text', col => col.notNull().defaultTo('user'))
    .addColumn('status', 'text', col => col.notNull().defaultTo('active'))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute()

  // session
  await db.schema
    .createTable('session')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('user_id', 'text', col => col.notNull().references('user.id'))
    .addColumn('secret_hash', 'bytea', col => col.notNull())
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute()

  // municipality
  await db.schema
    .createTable('municipality')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('state', 'text', col => col.notNull())
    .addColumn('latitude', 'double precision', col => col.notNull())
    .addColumn('longitude', 'double precision', col => col.notNull())
    .addColumn('is_deleted', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute()

  // project_category
  await db.schema
    .createTable('project_category')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('name', 'text', col => col.notNull().unique())
    .addColumn('is_deleted', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute()

  // project
  await db.schema
    .createTable('project')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('category_id', 'text', col => col.notNull().references('project_category.id'))
    .addColumn('municipality_id', 'text', col => col.notNull().references('municipality.id'))
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('responsible_name', 'text')
    .addColumn('responsible_role', 'text')
    .addColumn('responsible_phone', 'text')
    .addColumn('responsible_email', 'text', col => col.notNull())
    .addColumn('address_street', 'text', col => col.notNull())
    .addColumn('address_number', 'text')
    .addColumn('address_zip_code', 'text')
    .addColumn('latitude', 'double precision', col => col.notNull())
    .addColumn('longitude', 'double precision', col => col.notNull())
    .addColumn('is_deleted', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute()

  // survey
  await db.schema
    .createTable('survey')
    .ifNotExists()
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('is_deleted', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute()

  // research
  await db.schema
    .createTable('research')
    .ifNotExists()
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('survey_id', 'text', col => col.notNull().references('survey.id').onDelete('cascade'))
    .addColumn('municipality_id', 'text', col => col.notNull().references('municipality.id').onDelete('cascade'))
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('slug', 'text', col => col.notNull().unique())
    .addColumn('is_deleted', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute()

  // survey_question
  await db.schema
    .createTable('survey_question')
    .ifNotExists()
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('survey_id', 'text', col => col.notNull().references('survey.id').onDelete('cascade'))
    .addColumn('is_public', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('question', 'text', col => col.notNull())
    .addColumn('description', 'text')
    .addColumn('type', 'text', col => col.notNull())
    .addColumn('position', 'integer', col => col.notNull())
    .addColumn('is_deleted', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute()

  // survey_question_metadata
  await db.schema
    .createTable('survey_question_metadata')
    .ifNotExists()
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('survey_question_id', 'text', col => col.notNull().references('survey_question.id').onDelete('cascade'))
    .addColumn('type', 'text', col => col.notNull())
    .addColumn('value', 'text')
    .addColumn('position', 'integer', col => col.notNull())
    .addColumn('is_deleted', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute()

  // survey_answer
  await db.schema
    .createTable('survey_answer')
    .ifNotExists()
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('project_id', 'text', col => col.notNull().references('project.id').onDelete('cascade'))
    .addColumn('research_id', 'text', col => col.notNull().references('research.id').onDelete('cascade'))
    .addColumn('survey_id', 'text', col => col.notNull().references('survey.id').onDelete('cascade'))
    .addColumn('question_id', 'text', col => col.notNull().references('survey_question.id').onDelete('cascade'))
    .addColumn('answer', 'text', col => col.notNull())
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('survey_answer').ifExists().cascade().execute()
  await db.schema.dropTable('survey_question_metadata').ifExists().cascade().execute()
  await db.schema.dropTable('survey_question').ifExists().cascade().execute()
  await db.schema.dropTable('research').ifExists().cascade().execute()
  await db.schema.dropTable('survey').ifExists().cascade().execute()
  await db.schema.dropTable('project').ifExists().cascade().execute()
  await db.schema.dropTable('project_category').ifExists().cascade().execute()
  await db.schema.dropTable('municipality').ifExists().cascade().execute()
  await db.schema.dropTable('session').ifExists().cascade().execute()
  await db.schema.dropTable('user').ifExists().cascade().execute()
}
