import { DB } from "@/server/db/types";
import chardet from "chardet"
import iconv from "iconv-lite"
import { Kysely } from "kysely";
import z from "zod";
import {
  getProjectsListSchema,
  setProjectCategorySchema,
  setProjectSchema,
} from "./schemas";
import { idSchema } from "@/server/utils/schemas";
import { ulid } from "ulid";
import Papa from "papaparse";
import { fetchMunicipalities, fetchMunicipalityCords, fetchStates } from "../municipality/server";
import { MunicipalityResponseDTO } from "../municipality/types";

export async function getProjectsList(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof getProjectsListSchema>>
) {
  return await db
    .selectFrom("project")
    .select([
      "id",
      "name",
      "latitude",
      "longitude",
      "responsibleName",
      "categoryId",
      "municipalityId",
    ])
    .$if(!!params.categoryId, (qb) =>
      qb.where("categoryId", "=", params.categoryId ?? "")
    )
    .$if(!!params.municipalityId, (qb) =>
      qb.where("municipalityId", "=", params.municipalityId ?? "")
    )
    .where("isDeleted", "=", false)
    .execute();
}

export async function getProjectResearchs(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  const answers = await db
    .selectFrom("surveyAnswer")
    .where("projectId", "=", params.id)
    .where("surveyAnswer.projectId", "=", params.id)
    .selectAll()
    .execute();

  const questionIds = [...new Set(answers.map((answer) => answer.questionId))];

  const questions = await db
    .selectFrom("surveyQuestion")
    .where("id", "in", questionIds)
    .where("isDeleted", "=", false)
    .selectAll()
    .execute();

  const questionsMap = new Map(
    questions.map((question) => [question.id, question])
  );

  const output: Record<
    string,
    {
      createdAt: Date;
      answers: Array<{
        question: string;
        answer: string;
        type: string;
        position: number;
      }>;
    }
  > = {};

  for (const answer of answers) {
    if (!output[answer.researchId]) {
      output[answer.researchId] = {
        createdAt: answer.createdAt,
        answers: [],
      };
    }

    const question = questionsMap.get(answer.questionId);

    if (!question) {
      continue;
    }

    output[answer.researchId].answers.push({
      question: question.question,
      answer: answer.answer,
      type: question.type,
      position: question.position,
    });
  }

  for (const researchId in output) {
    output[researchId].answers = output[researchId].answers.sort(
      (a, b) => a.position - b.position
    );
  }

  return output;
}

export async function getProject(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  return await db
    .selectFrom("project")
    .selectAll()
    .where("id", "=", params.id)
    .executeTakeFirstOrThrow();
}

export async function setProject(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof setProjectSchema>>
) {
  if (params.id) {
    return await db
      .updateTable("project")
      .set(params)
      .where("id", "=", params.id)
      .returningAll()
      .execute();
  }

  return await db
    .insertInto("project")
    .values({ id: ulid(), ...params })
    .returningAll()
    .execute();
}

export async function setProjectsImport(
  db: Kysely<DB>,
  params: {
    id: string
    file: File
  }
) {
  let newRows = 0;

  const arrayBuffer = await params.file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const encoding = chardet.detect(buffer);

  if (!encoding) {
    throw new Error("File decoding failed")
  }

  const utf8string = iconv.decode(buffer, encoding)
  const csv = Papa.parse(utf8string, { header: true })

  if (!csv.data) {
    throw new Error("Invalid data")
  }

  const states = await fetchStates()
  const municipalities: Record<string, MunicipalityResponseDTO[]> = {}
  const municipalitiesCords: Record<string, { latitude: number, longitude: number }> = {}

  const log: { type: string; message: string }[] = [];

  for (let i = 0; i < csv.data.length; i++) {
    const row = csv.data[i];

    if (row instanceof Object !== true) {
      log.push({ type: "error", message: `Coluna ${i} inválida` })
      continue
    }

    const values = Object.values(row)

    const state = states.find(s => s.sigla === values[0])

    if (!state) {
      log.push({ type: "error", message: `Coluna ${i} inválida. Estado nao existe.` })
      continue
    }

    if (!municipalities[state.sigla]) {
      municipalities[state.sigla] = await fetchMunicipalities({ id: state.sigla })
    }

    const municipality = municipalities[state.sigla].find(m => m.nome === String(values[1]).toUpperCase())

    if (!municipality) {
      log.push({ type: "error", message: `Coluna ${i} inválida. Municipio nao existe.` })
      continue
    }

    if (!municipalitiesCords[municipality.nome]) {
      const data = await fetchMunicipalityCords({ name: municipality.nome, state: state.nome })

      if (!data) {
        log.push({ type: "error", message: `Coluna ${i} inválida. Municipio invalido.` })
        continue
      }

      municipalitiesCords[municipality.nome] = data
    }

    let municipalityId: string | null

    const existingMunicipality = await db.selectFrom("municipality").select(["id"]).where("state", "=", state.sigla).where("name", "=", municipality.nome).executeTakeFirst()

    if (existingMunicipality) {
      municipalityId = existingMunicipality.id

      await db.updateTable("municipality").set({ isDeleted: false }).where("id", "=", municipalityId).execute()
    } else {
      const newMunicipality = await db.insertInto("municipality").values({
        id: ulid(),
        name: municipality.nome,
        state: state.sigla,
        longitude: municipalitiesCords[municipality.nome].longitude,
        latitude: municipalitiesCords[municipality.nome].latitude
      }).returning(["id"]).executeTakeFirstOrThrow()

      municipalityId = newMunicipality.id
    }

    if (!values[2]) {
      log.push({ type: "error", message: `Coluna ${i} inválida. Categoria nao existe.` })
      continue
    }

    let categoryId: string | null
    const existingCategory = await db.selectFrom("projectCategory").select(["id"]).where("name", "=", values[2]).executeTakeFirst()
    if (existingCategory) {
      categoryId = existingCategory.id
    } else {
      const newCategory = await db.insertInto("projectCategory").values({
        id: ulid(),
        name: values[2]
      }).returning(["id"]).executeTakeFirstOrThrow()

      categoryId = newCategory.id
    }

    if (!categoryId) {
      log.push({ type: "error", message: `Coluna ${i} inválida. Categoria inválida.` })
      continue
    }

    const street = values[8]
    const number = values[9]
    const zipCode = values[10]

    if (!street || !zipCode || !number) {
      log.push({ type: "error", message: `Coluna ${i} inválida. Endereço inválido.` })
      continue
    }

    const search = `${street},${number},${zipCode},${municipality.nome},Brasil`;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${search}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (!data.results[0]) {
      log.push({ type: "error", message: `Coluna ${i} inválida. Endereço não encontrado.` })
      continue
    }

    const lat = data.results[0].geometry.location.lat;
    const lng = data.results[0].geometry.location.lng;

    if (!lat || !lng) {
      log.push({ type: "error", message: `Coluna ${i} inválida. Endereço não encontrado.` })
      continue
    }

    const name = values[3]
    const responsibleName = values[4]
    const responsibleRole = values[5]
    const responsiblePhone = values[6]
    const responsibleEmail = values[7]

    if (!name || !responsibleEmail) {
      log.push({ type: "error", message: `Coluna ${i} inválida. Obrigatório nome e email do responsável.` })
      continue
    }

    const existingProject = await db.selectFrom("project").select(["id"]).where("name", "=", name).where("municipalityId", "=", municipalityId).executeTakeFirst()
    if (existingProject) {
      log.push({ type: "warning", message: `Coluna ${i} inválida. Unidade já existe.` })
      continue
    }

    await db.insertInto("project").values({
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
    }).execute()

    log.push({ type: "success", message: `Coluna ${i} criada com sucesso.` })

    newRows++
  }

  return { newRows, log }
}

export async function softDeleteProject(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  return await db
    .updateTable("project")
    .set({ isDeleted: true })
    .where("id", "=", params.id)
    .execute();
}

// Categories
export async function getProjectCategories(db: Kysely<DB>) {
  return await db.selectFrom("projectCategory").selectAll().execute();
}

export async function getProjectCategory(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  return await db
    .selectFrom("projectCategory")
    .selectAll()
    .where("id", "=", params.id)
    .executeTakeFirstOrThrow();
}

export async function setProjectCategory(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof setProjectCategorySchema>>
) {
  const exists = await db
    .selectFrom("projectCategory")
    .selectAll()
    .where("name", "=", params.name)
    .executeTakeFirst();

  if (exists) {
    return await db
      .updateTable("projectCategory")
      .set(params)
      .where("id", "=", exists.id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  return await db
    .insertInto("projectCategory")
    .values({ id: ulid(), ...params })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function softDeleteProjectCategory(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  return await db
    .updateTable("projectCategory")
    .set({ isDeleted: true })
    .where("id", "=", params.id)
    .execute();
}
