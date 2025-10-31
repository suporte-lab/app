import z from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { putMunicipalitySchema, setMunicipalitySchema } from "../schemas";
import { authMiddleware } from "./auth";
import { ulid } from "ulid";
import { MunicipalityResponseDTO, StateResponseDTO } from "../types";

export const municipalitiesRoute = new Hono()
  .get("/", async (c) => {
    const data = await db
      .selectFrom("municipality")
      .selectAll()
      .where("isDeleted", "!=", true)
      .execute();
    return c.json({ data });
  })
  .get("/:id", async (c) => {
    const data = await db
      .selectFrom("municipality")
      .selectAll()
      .where("id", "=", c.req.param("id"))
      .where("isDeleted", "!=", true)
      .executeTakeFirst();

    return c.json({ data });
  })
  .post(
    "/",
    authMiddleware,
    zValidator("json", setMunicipalitySchema),
    async (c) => {
      const payload = c.req.valid("json");

      const existing = await db
        .selectFrom("municipality")
        .select(["id"])
        .where("name", "=", payload.name)
        .where("state", "=", payload.state)
        .executeTakeFirst();

      if (existing) {
        const data = await db
          .updateTable("municipality")
          .set({ ...payload, isDeleted: false })
          .where("id", "=", existing.id)
          .returningAll()
          .executeTakeFirst();

        return c.json({ data });
      }

      const data = await db
        .insertInto("municipality")
        .values({ ...payload, id: ulid() })
        .returningAll()
        .executeTakeFirst();

      return c.json({ data });
    }
  )
  .put(
    "/:id",
    authMiddleware,
    zValidator("json", putMunicipalitySchema),
    async (c) => {
      const payload = c.req.valid("json");

      const data = await db
        .updateTable("municipality")
        .set({
          name: payload.name,
          state: payload.state,
          latitude: payload.latitude,
          longitude: payload.longitude,
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
      .updateTable("municipality")
      .set({ isDeleted: true })
      .where("id", "=", c.req.param("id"))
      .execute();

    return c.json({ deleted: c.req.param("id") });
  });

export async function fetchStates() {
  const res = await fetch("https://brasilapi.com.br/api/ibge/uf/v1", {
    signal: AbortSignal.timeout(2000),
  });
  if (!res.ok) throw new Error("Failed to fetch states");

  return res.json() as Promise<StateResponseDTO[]>;
}

export async function fetchMunicipalities(id: string) {
  const res = await fetch(
    `https://brasilapi.com.br/api/ibge/municipios/v1/${id}`,
    { signal: AbortSignal.timeout(2000) }
  );
  if (!res.ok) throw new Error("Failed to fetch municipalities");

  return res.json() as Promise<MunicipalityResponseDTO[]>;
}

export async function fetchMunicipalityCords(state: string, name: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?city=${name}&state=${state}&country=Brazil&format=json`
  );
  const data = await res.json();

  const parsed = z
    .object({
      data: z
        .object({ lat: z.coerce.number(), lon: z.coerce.number() })
        .array(),
    })
    .safeParse({ data });

  if (!parsed.success) return null;

  if (!parsed.data.data[0]) return null;

  return {
    latitude: parsed.data.data[0].lat,
    longitude: parsed.data.data[0].lon,
  };
}
