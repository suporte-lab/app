import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("project_category")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull().unique())
    .addColumn("is_deleted", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await db.schema
    .createTable("project")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("category_id", "text", (col) =>
      col.notNull().references("project_category.id")
    )
    .addColumn("municipality_id", "text", (col) =>
      col.notNull().references("municipality.id")
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("responsible_name", "text")
    .addColumn("responsible_role", "text")
    .addColumn("responsible_phone", "text")
    .addColumn("responsible_email", "text", (col) => col.notNull())
    .addColumn("address_street", "text", (col) => col.notNull())
    .addColumn("address_number", "text")
    .addColumn("address_zip_code", "text")
    .addColumn("latitude", "double precision", (col) => col.notNull())
    .addColumn("longitude", "double precision", (col) => col.notNull())
    .addColumn("is_deleted", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )

    .addUniqueConstraint("project_name_category_municipality_unique", [
      "name",
      "category_id",
      "municipality_id",
    ])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("project").execute();
  await db.schema.dropTable("project_category").execute();
}
