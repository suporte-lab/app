import { DB } from "@/server/db/types";
import { Kysely } from "kysely";
import z from "zod";
import {
  getProjectsListSchema,
  setProjectCategorySchema,
  setProjectSchema,
} from "./schemas";
import { idSchema } from "@/server/utils/schemas";
import { ulid } from "ulid";

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
