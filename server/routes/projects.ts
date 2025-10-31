import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { importSchema, putProjectSchema, setProjectSchema } from "../schemas";
import { authMiddleware } from "./auth";
import { ulid } from "ulid";
import Papa from "papaparse";
import chardet from "chardet";
import iconv from "iconv-lite";
import {
  fetchMunicipalities,
  fetchMunicipalityCords,
  fetchStates,
} from "./municipalities";
import { MunicipalityResponseDTO } from "../types";

export const projectsRoute = new Hono()
  .get("/", async (c) => {
    const data = await db
      .selectFrom("project")
      .selectAll()
      .where("isDeleted", "!=", true)
      .execute();

    return c.json({ data });
  })
  .get("/:id", async (c) => {
    const data = await db
      .selectFrom("project")
      .selectAll()
      .where("id", "=", c.req.param("id"))
      .where("isDeleted", "!=", true)
      .executeTakeFirstOrThrow();

    return c.json({ data });
  })
  .post(
    "/",
    authMiddleware,
    zValidator("json", setProjectSchema),
    async (c) => {
      const payload = c.req.valid("json");

      const data = await db
        .insertInto("project")
        .values({ ...payload, id: ulid() })
        .returningAll()
        .executeTakeFirst();

      return c.json({ data });
    }
  )
  .put(
    "/:id",
    authMiddleware,
    zValidator("json", putProjectSchema),
    async (c) => {
      const payload = c.req.valid("json");

      const data = await db
        .updateTable("project")
        .set({ ...payload, isDeleted: false })
        .where("id", "=", c.req.param("id"))
        .returningAll()
        .executeTakeFirst();

      return c.json({ data });
    }
  )
  .delete("/:id", authMiddleware, async (c) => {
    await db
      .updateTable("project")
      .set({ isDeleted: true })
      .where("id", "=", c.req.param("id"))
      .execute();

    return c.json({ deleted: c.req.param("id") });
  })
  .post(
    "/import",
    authMiddleware,
    zValidator("form", importSchema),
    async (c) => {
      const payload = c.req.valid("form");

      let newRows = 0;

      const arrayBuffer = await payload.file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const encoding = chardet.detect(buffer);

      if (!encoding) {
        throw new Error("File decoding failed");
      }

      const utf8string = iconv.decode(buffer, encoding);
      const csv = Papa.parse(utf8string, { header: true });

      if (!csv.data) {
        throw new Error("Invalid data");
      }

      const states = await fetchStates();
      const municipalities: Record<string, MunicipalityResponseDTO[]> = {};
      const municipalitiesCords: Record<
        string,
        { latitude: number; longitude: number }
      > = {};

      const log: { type: string; message: string }[] = [];

      for (let i = 0; i < csv.data.length; i++) {
        const row = csv.data[i];
        if (row instanceof Object !== true) continue;

        const values = Object.values(row);
        if (!values[0].length) continue;

        console.log(values);

        const state = states.find((s) => s.sigla === values[0]);

        if (!state) {
          log.push({
            type: "error",
            message: `Coluna ${i + 1} inválida. Estado nāo existe.`,
          });
          continue;
        }

        if (!municipalities[state.sigla]) {
          municipalities[state.sigla] = await fetchMunicipalities(state.sigla);
        }

        const municipality = municipalities[state.sigla]!.find(
          (m) => m.nome === String(values[1]).toUpperCase()
        );

        if (!municipality) {
          log.push({
            type: "error",
            message: `Coluna ${i + 1} inválida. Município nāo existe.`,
          });
          continue;
        }

        if (!municipalitiesCords[municipality.nome]) {
          const data = await fetchMunicipalityCords(
            state.nome,
            municipality.nome
          );

          if (!data) {
            log.push({
              type: "error",
              message: `Coluna ${i + 1} inválida. Município inválido.`,
            });
            continue;
          }

          municipalitiesCords[municipality.nome] = data;
        }

        let municipalityId: string | null;

        const existingMunicipality = await db
          .selectFrom("municipality")
          .select(["id"])
          .where("state", "=", state.sigla)
          .where("name", "=", municipality.nome)
          .executeTakeFirst();

        if (existingMunicipality) {
          municipalityId = existingMunicipality.id;

          await db
            .updateTable("municipality")
            .set({ isDeleted: false })
            .where("id", "=", municipalityId)
            .execute();
        } else {
          const newMunicipality = await db
            .insertInto("municipality")
            .values({
              id: ulid(),
              name: municipality.nome,
              state: state.sigla,
              longitude: municipalitiesCords[municipality.nome]!.longitude,
              latitude: municipalitiesCords[municipality.nome]!.latitude,
            })
            .returning(["id"])
            .executeTakeFirstOrThrow();

          municipalityId = newMunicipality.id;
        }

        if (!values[2]) {
          log.push({
            type: "error",
            message: `Coluna ${i + 1} inválida. Categoria nāo existe.`,
          });
          continue;
        }

        let categoryId: string | null;
        const existingCategory = await db
          .selectFrom("projectCategory")
          .select(["id"])
          .where("name", "=", values[2])
          .executeTakeFirst();
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const newCategory = await db
            .insertInto("projectCategory")
            .values({
              id: ulid(),
              name: values[2],
            })
            .returning(["id"])
            .executeTakeFirstOrThrow();

          categoryId = newCategory.id;
        }

        if (!categoryId) {
          log.push({
            type: "error",
            message: `Coluna ${i + 1} inválida. Categoria inválida.`,
          });
          continue;
        }

        const street = values[8];
        const number = values[9];
        const zipCode = values[10];

        if (!street || !zipCode || !number) {
          log.push({
            type: "error",
            message: `Coluna ${i + 1} inválida. Endereço inválido.`,
          });
          continue;
        }

        const search = `${street},${number},${zipCode},${municipality.nome},Brasil`;

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${search}&key=${
            import.meta.env.VITE_GOOGLE_MAPS_API_KEY
          }`
        );

        const data = (await response.json()) as {
          results: { geometry: { location: { lat: number; lng: number } } }[];
        };

        if (!data.results[0]) {
          log.push({
            type: "error",
            message: `Coluna ${i + 1} inválida. Endereço não encontrado.`,
          });
          continue;
        }

        const lat = data.results[0].geometry.location.lat;
        const lng = data.results[0].geometry.location.lng;

        if (!lat || !lng) {
          log.push({
            type: "error",
            message: `Coluna ${i + 1} inválida. Endereço não encontrado.`,
          });
          continue;
        }

        const name = values[3];
        const responsibleName = values[4];
        const responsibleRole = values[5];
        const responsiblePhone = values[6];
        const responsibleEmail = values[7];

        if (!name || !responsibleEmail) {
          log.push({
            type: "error",
            message: `Coluna ${
              i + 1
            } inválida. Obrigatório nome e email do responsável.`,
          });
          continue;
        }

        const existingProject = await db
          .selectFrom("project")
          .select(["id"])
          .where("name", "=", name)
          .where("municipalityId", "=", municipalityId)
          .executeTakeFirst();
        if (existingProject) {
          log.push({
            type: "warning",
            message: `Coluna ${i + 1} inválida. Unidade já existe.`,
          });
          continue;
        }

        await db
          .insertInto("project")
          .values({
            id: ulid(),
            name,
            responsibleName,
            responsiblePhone,
            responsibleRole,
            responsibleEmail,
            municipalityId,
            categoryId,
            addressStreet: street,
            addressNumber: number,
            addressZipCode: zipCode,
            latitude: lat,
            longitude: lng,
          })
          .execute();

        log.push({
          type: "success",
          message: `Coluna ${i + 1} criada com sucesso.`,
        });

        newRows++;
      }

      return c.json({ newRows, log });
    }
  );
