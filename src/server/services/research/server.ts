import { DB } from "@/server/db/types";
import { Kysely } from "kysely";
import { idSchema } from "@/server/utils/schemas";
import z from "zod";
import {
  getSurveyAnswersByProjectIdSchema,
  setResearchSchema,
  setSurveyAnswerSchema,
  setSurveyQuestionSchema,
  setSurveyQuestionsOrderSchema,
  setSurveySchema,
} from "./schemas";
import { ulid } from "ulid";
import { Resend } from "resend";
import { mailShareLinkTemplate } from "@/server/utils/mail";

const resend = new Resend(process.env.RESEND_API_KEY!);

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Research
export async function sendResearchRequestEmail(
  params: z.infer<ReturnType<typeof idSchema>>,
  db: Kysely<DB>
) {
  const research = await db
    .selectFrom("research")
    .selectAll()
    .where("id", "=", params.id)
    .executeTakeFirstOrThrow();

  const projects = await db
    .selectFrom("project")
    .selectAll()
    .where("municipalityId", "=", research.municipalityId)
    .execute();

  const answers = await db
    .selectFrom("surveyAnswer")
    .selectAll()
    .where("researchId", "=", research.id)
    .execute();

  for (let project of projects) {
    const isValidEmail = validateEmail(project.responsibleEmail);
    const isAnwered = answers.some((answer) => answer.projectId === project.id);
    if (isAnwered || !isValidEmail) continue;

    const template = mailShareLinkTemplate(
      `${process.env.APP_BASE_URL}/project/${project.id}/survey`
    );

    const res = await resend.emails.send({
      from: "CincoBásicos <noreply@notifications.cincobasicos.org>",
      to: project.responsibleEmail,
      subject: "Pedido de pesquisa",
      html: template,
    });

    console.log(res, project.responsibleEmail);
  }

  return { success: true };
}

export async function getResearchBySlug(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  return await db
    .selectFrom("research")
    .where("slug", "=", params.id)
    .selectAll()
    .executeTakeFirstOrThrow();
}

export async function getResearchResultsByProjectId(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  const answersData = await db
    .selectFrom("surveyAnswer")
    .selectAll()
    .where("projectId", "=", params.id)
    .execute();

  const surveyIds = new Set<string>(answersData.map((r) => r.surveyId));
  const researchIds = new Set<string>(answersData.map((r) => r.researchId));

  const questionsData = await db
    .selectFrom("surveyQuestion")
    .selectAll()
    .where("surveyId", "in", Array.from(surveyIds))
    .where("isDeleted", "=", false)
    .orderBy("position")
    .execute();

  const researchsData = await db
    .selectFrom("research")
    .selectAll()
    .where("id", "in", Array.from(researchIds))
    .where("isDeleted", "=", false)
    .execute();

  const results: Record<string, Record<string, string[]>> = {};

  for (const a of answersData) {
    if (!a.answer) continue;

    if (!results[a.questionId]) {
      results[a.questionId] = {};
    }

    if (!results[a.questionId][a.researchId]) {
      results[a.questionId][a.researchId] = [];
    }

    results[a.questionId][a.researchId].push(a.answer);
  }

  const questions: Record<string, { question: string; type: string }> = {};
  for (const question of questionsData) {
    questions[question.id] = {
      question: question.question,
      type: question.type,
    };
  }

  const researchs: Record<string, { name: string; createdAt: Date }> = {};
  for (const research of researchsData) {
    researchs[research.id] = {
      name: research.name,
      createdAt: research.createdAt,
    };
  }

  return { results, questions, researchs };
}

export async function getResearchResults(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  const research = await db
    .selectFrom("research")
    .selectAll()
    .where("id", "=", params.id)
    .executeTakeFirstOrThrow();

  if (!research) {
    throw new Error("Research not found");
  }

  const questionsData = await db
    .selectFrom("surveyQuestion")
    .selectAll()
    .where("surveyId", "=", research.surveyId)
    .where("isDeleted", "=", false)
    .orderBy("position")
    .execute();

  const answersData = await db
    .selectFrom("surveyAnswer")
    .selectAll()
    .where("researchId", "=", params.id)
    .execute();

  const results: Record<string, Record<string, string[]>> = {};

  for (const a of answersData) {
    if (!a.answer) continue;

    if (!results[a.projectId]) {
      results[a.projectId] = {};
    }

    if (!results[a.projectId][a.questionId]) {
      results[a.projectId][a.questionId] = [];
    }

    results[a.projectId][a.questionId].push(a.answer);
  }

  const questions: Record<string, string> = {};
  for (const question of questionsData) {
    questions[question.id] = question.question;
  }

  return { results, research, questions };
}

export async function getResearch(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  return await db
    .selectFrom("research")
    .where("id", "=", params.id)
    .selectAll()
    .executeTakeFirstOrThrow();
}

export async function getResearchsList(db: Kysely<DB>) {
  return await db
    .selectFrom("research")
    .selectAll()
    .orderBy("createdAt", "desc")
    .execute();
}

export async function getResearchsResultsList(db: Kysely<DB>) {
  const rows = await db
    .selectFrom("research")
    .selectAll()
    .orderBy("createdAt", "desc")
    .execute();

  if (!rows.length) return { researchs: {}, questions: {} };

  const questionsData = await db
    .selectFrom("surveyQuestion")
    .selectAll()
    .where(
      "surveyId",
      "in",
      rows.map((r) => r.surveyId)
    )
    .where("isDeleted", "=", false)
    .orderBy("position")

    .execute();

  const questions: Record<string, string> = {};

  for (const question of questionsData) {
    questions[question.id] = question.question;
  }

  const researchs: Record<
    string,
    Awaited<ReturnType<typeof getResearchResults>>
  > = {};

  for (const row of rows) {
    researchs[row.id] = await getResearchResults(db, { id: row.id });
  }

  return { researchs, questions };
}

export async function setResearch(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof setResearchSchema>>
) {
  if (params.id) {
    return await db
      .updateTable("research")
      .set(params)
      .where("id", "=", params.id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  return await db
    .insertInto("research")
    .values({ id: ulid(), ...params, municipalityId: params.municipalityId })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function softDeleteResearch(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  return await db
    .updateTable("research")
    .set({ isDeleted: true })
    .where("id", "=", params.id)
    .executeTakeFirstOrThrow();
}

// Survey
export async function getSurveysList(db: Kysely<DB>) {
  return await db
    .selectFrom("survey")
    .selectAll()
    .where("isDeleted", "=", false)
    .execute();
}

export async function getSurvey(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  return await db
    .selectFrom("survey")
    .where("id", "=", params.id)
    .selectAll()
    .executeTakeFirstOrThrow();
}

export async function setSurvey(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof setSurveySchema>>
) {
  if (params.id) {
    return await db
      .updateTable("survey")
      .set(params)
      .where("id", "=", params.id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  return await db
    .insertInto("survey")
    .values({ id: ulid(), ...params })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function softDeleteSurvey(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  return await db
    .updateTable("survey")
    .set({ isDeleted: true })
    .where("id", "=", params.id)
    .executeTakeFirstOrThrow();
}

// Survey Question
export async function getQuestionsList(db: Kysely<DB>) {
  return await db.selectFrom("surveyQuestion").selectAll().execute();
}

export async function getSurveyQuestions(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  const rows = await db
    .selectFrom("surveyQuestion")
    .selectAll()
    .where("surveyId", "=", params.id)
    .where("isDeleted", "=", false)
    .orderBy("position")
    .execute();

  if (!rows.length) return [];

  const metadata = await db
    .selectFrom("surveyQuestionMetadata")

    .selectAll()
    .where("isDeleted", "=", false)
    .where(
      "surveyQuestionId",
      "in",
      rows.map((r) => r.id)
    )
    .orderBy("position")
    .execute();

  return rows.map((r) => ({
    ...r,
    metadata: metadata.filter((m) => m.surveyQuestionId === r.id) ?? [],
  }));
}

export async function getSurveyQuestion(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  const row = await db
    .selectFrom("surveyQuestion")
    .selectAll()
    .where("id", "=", params.id)
    .executeTakeFirstOrThrow();

  const metadata = await db
    .selectFrom("surveyQuestionMetadata")
    .selectAll()
    .where("surveyQuestionId", "=", params.id)
    .where("isDeleted", "=", false)
    .orderBy("position")
    .execute();

  return { ...row, metadata };
}

export async function setSurveyQuestion(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof setSurveyQuestionSchema>>
) {
  let questionId: string | null = null;

  if (params.type === "select" && !params.options?.length) {
    throw new Error("Select questions must have options");
  }

  if (params.id) {
    const row = await db
      .updateTable("surveyQuestion")
      .set({
        surveyId: params.surveyId,
        question: params.question,
        description: params.description,
        type: params.type,
        position: 0,
        isPublic: params.visibility,
      })
      .where("id", "=", params.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    questionId = row.id;
  } else {
    const row = await db
      .insertInto("surveyQuestion")
      .values({
        id: ulid(),
        surveyId: params.surveyId,
        question: params.question,
        description: params.description,
        type: params.type,
        position: 0,
        isPublic: params.visibility,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    questionId = row.id;
  }

  if (!questionId) {
    throw new Error("Failed to create question");
  }

  if (params.type === "select" && params.options?.length) {
    const existingOptions = await db
      .selectFrom("surveyQuestionMetadata")
      .selectAll()
      .where("surveyQuestionId", "=", questionId)
      .where("type", "=", "select-option")
      .execute();

    for (const opt of existingOptions) {
      if (!params.options.find((o) => o.id === opt.id)) {
        await db
          .updateTable("surveyQuestionMetadata")
          .set({ isDeleted: true })
          .where("id", "=", opt.id)
          .execute();
      }
    }

    for (let i = 0; i < params.options.length; i++) {
      const option = params.options[i];

      const existing = await db
        .selectFrom("surveyQuestionMetadata")
        .selectAll()
        .where("surveyQuestionId", "=", questionId)
        .where("type", "=", "select-option")
        .where("id", "=", option.id)
        .executeTakeFirst();

      if (existing) {
        await db
          .updateTable("surveyQuestionMetadata")
          .set({ value: option.value })
          .where("id", "=", option.id)
          .execute();
      } else {
        await db
          .insertInto("surveyQuestionMetadata")
          .values({
            id: ulid(),
            surveyQuestionId: questionId,
            type: "select-option",
            value: option.value,
            position: i,
          })
          .execute();
      }
    }
  }

  return await db
    .selectFrom("surveyQuestion")
    .selectAll()
    .where("id", "=", questionId)
    .executeTakeFirstOrThrow();
}

export async function setSurveyQuestionsOrder(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof setSurveyQuestionsOrderSchema>>
) {
  for (let i = 0; i < params.questions.length; i++) {
    const questionId = params.questions[i];

    await db
      .updateTable("surveyQuestion")
      .set({ position: i })
      .where("id", "=", questionId)
      .execute();
  }
}

export async function softDeleteSurveyQuestion(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof idSchema>>
) {
  return await db
    .updateTable("surveyQuestion")
    .set({ isDeleted: true })
    .where("id", "=", params.id)
    .executeTakeFirstOrThrow();
}

// Survey Answer
export async function getSurveyAnswersByProjectId(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof getSurveyAnswersByProjectIdSchema>>
) {
  return await db
    .selectFrom("surveyAnswer")
    .selectAll()
    .where("researchId", "=", params.researchId)
    .where("projectId", "=", params.projectId)
    .execute();
}

export async function setSurveyAnswer(
  db: Kysely<DB>,
  params: z.infer<ReturnType<typeof setSurveyAnswerSchema>>
) {
  for (const answer of params.answers) {
    const existingAnswer = await db
      .selectFrom("surveyAnswer")
      .selectAll()
      .where("researchId", "=", params.researchId)
      .where("projectId", "=", params.projectId)
      .where("questionId", "=", answer.questionId)
      .executeTakeFirst();

    if (existingAnswer) {
      await db
        .updateTable("surveyAnswer")
        .set({ answer: answer.answer })
        .where("id", "=", existingAnswer.id)
        .execute();

      continue;
    }

    await db
      .insertInto("surveyAnswer")
      .values({
        id: ulid(),
        surveyId: params.surveyId,
        projectId: params.projectId,
        researchId: params.researchId,
        questionId: answer.questionId,
        answer: answer.answer,
      })
      .execute();
  }
}
