import { DB } from "@/server/db/types";
import { Kysely } from "kysely";
import { fetchMunicipalityCordsSchema, setMunicipalitySchema } from "./schemas";
import z from "zod";
import { ulid } from "ulid";
import { idSchema } from "@/server/utils/schemas";
import { MunicipalityResponseDTO, StateResponseDTO } from "./types";

export async function getMunicipalitiesList(db: Kysely<DB>) {
  const rows = await db
    .selectFrom("municipality")
    .selectAll()
    .where("isDeleted", "=", false)
    .orderBy("createdAt", "asc")
    .execute();

  return rows;
}

export async function getMunicipality(
  db: Kysely<DB>,
  { id }: z.infer<ReturnType<typeof idSchema>>
) {
  const row = await db
    .selectFrom("municipality")
    .where("id", "=", id)
    .where("isDeleted", "=", false)
    .selectAll()
    .executeTakeFirstOrThrow();

  return row;
}

export async function setMunicipality(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof setMunicipalitySchema>>
) {
  const row = await db
    .selectFrom("municipality")
    .where("state", "=", params.state)
    .where("name", "=", params.name)
    .selectAll()
    .executeTakeFirst();

  if (row) {
    return await db
      .updateTable("municipality")
      .set({ ...params, isDeleted: false })
      .where("id", "=", row.id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  return db
    .insertInto("municipality")
    .values({
      id: ulid(),
      ...params,
      createdAt: new Date(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export function softDeleteMunicipality(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  return db
    .updateTable("municipality")
    .set({ isDeleted: true })
    .where("id", "=", params.id)
    .execute();
}

export async function fetchStates() {
  const res = await fetch("https://brasilapi.com.br/api/ibge/uf/v1", {
    signal: AbortSignal.timeout(2000),
  });
  if (!res.ok) throw new Error("Failed to fetch states");

  return res.json() as Promise<StateResponseDTO[]>;
}

export async function fetchMunicipalities(
  params: z.infer<ReturnType<typeof idSchema>>
) {
  const res = await fetch(
    `https://brasilapi.com.br/api/ibge/municipios/v1/${params.id}`,
    { signal: AbortSignal.timeout(2000) }
  );
  if (!res.ok) throw new Error("Failed to fetch municipalities");

  return res.json() as Promise<MunicipalityResponseDTO[]>;
}

export async function fetchMunicipalityCords(
  params: z.infer<ReturnType<typeof fetchMunicipalityCordsSchema>>
) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?city=${params.name}&state=${params.state}&country=Brazil&format=json`
  );
  const data = await res.json();

  if (data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  }
}
