import z from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { putProjectCategorySchema, setProjectCategorySchema } from "../schemas";
import { authMiddleware } from "./auth";
import { ulid } from "ulid";

export const categoriesRoute = new Hono()
  .get("/", async (c) => {
    const data = await db
      .selectFrom("projectCategory")
      .selectAll()
      .where("isDeleted", "!=", true)
      .execute();
    return c.json({ data });
  })
  .get("/:id", async (c) => {
    const data = await db
      .selectFrom("projectCategory")
      .selectAll()
      .where("id", "=", c.req.param("id"))
      .where("isDeleted", "!=", true)
      .executeTakeFirstOrThrow();

    return c.json({ data });
  })
  .post(
    "/",
    authMiddleware,
    zValidator("json", setProjectCategorySchema),
    async (c) => {
      const payload = c.req.valid("json");

      const existing = await db
        .selectFrom("projectCategory")
        .select(["id"])
        .where("name", "=", payload.name)
        .executeTakeFirst();

      console.log(existing, payload);

      if (existing) {
        const data = await db
          .updateTable("projectCategory")
          .set({ ...payload, isDeleted: false })
          .where("id", "=", existing.id)
          .returningAll()
          .executeTakeFirst();

        return c.json({ data });
      }

      const data = await db
        .insertInto("projectCategory")
        .values({
          id: ulid(),
          name: payload.name,
        })
        .returningAll()
        .executeTakeFirst();

      return c.json({ data });
    }
  )
  .put(
    "/:id",
    authMiddleware,
    zValidator("json", putProjectCategorySchema),
    async (c) => {
      const payload = c.req.valid("json");

      const data = await db
        .updateTable("projectCategory")
        .set({
          name: payload.name,
          isDeleted: false,
        })
        .where("id", "=", c.req.param("id"))
        .returningAll()
        .executeTakeFirst();

      return c.json({ data });
    }
  )
  .delete("/:id", authMiddleware, async (c) => {
    await db
      .updateTable("projectCategory")
      .set({ isDeleted: true })
      .where("id", "=", c.req.param("id"))
      .execute();

    return c.json({ deleted: c.req.param("id") });
  });
