import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("survey")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("is_deleted", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await db.schema
    .createTable("research")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("survey_id", "text", (col) =>
      col.notNull().references("survey.id").onDelete("cascade")
    )
    .addColumn("municipality_id", "text", (col) =>
      col.notNull().references("municipality.id").onDelete("cascade")
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("is_deleted", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // survey_question
  await db.schema
    .createTable("survey_question")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("survey_id", "text", (col) =>
      col.notNull().references("survey.id").onDelete("cascade")
    )
    .addColumn("is_public", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("question", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("position", "integer", (col) => col.notNull())
    .addColumn("is_deleted", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // survey_question_metadata
  await db.schema
    .createTable("survey_question_metadata")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("survey_question_id", "text", (col) =>
      col.notNull().references("survey_question.id").onDelete("cascade")
    )
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("value", "text")
    .addColumn("position", "integer", (col) => col.notNull())
    .addColumn("is_deleted", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // survey_answer
  await db.schema
    .createTable("survey_answer")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("project_id", "text", (col) =>
      col.notNull().references("project.id").onDelete("cascade")
    )
    .addColumn("research_id", "text", (col) =>
      col.notNull().references("research.id").onDelete("cascade")
    )
    .addColumn("survey_id", "text", (col) =>
      col.notNull().references("survey.id").onDelete("cascade")
    )
    .addColumn("question_id", "text", (col) =>
      col.notNull().references("survey_question.id").onDelete("cascade")
    )
    .addColumn("answer", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("survey").execute();
  await db.schema.dropTable("survey_question").execute();
  await db.schema.dropTable("survey_question_metadata").execute();
  await db.schema.dropTable("survey_answer").execute();
}
