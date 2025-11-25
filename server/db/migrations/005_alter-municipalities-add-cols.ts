import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("project")
    .addColumn("number_of_employees", "integer", (col) =>
      col.notNull().defaultTo(0)
    )
    .addColumn("children_in_care", "integer", (col) =>
      col.notNull().defaultTo(0)
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("project")
    .dropColumn("number_of_employees")
    .dropColumn("children_in_care")
    .execute();
}
