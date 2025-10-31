import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { importSchema, setResearchSchema } from "../schemas";
import { authMiddleware } from "./auth";
import { ulid } from "ulid";
import { mailShareLinkTemplate, resend, validateEmail } from "../services/mail";
import { isBooleanLike } from "../../frontend/src/lib/utils";
import Papa from "papaparse";

export const researchsRoute = new Hono()
  .get("/", async (c) => {
    const data = await db
      .selectFrom("research")
      .selectAll()
      .where("isDeleted", "!=", true)
      .execute();

    return c.json({ data });
  })
  .get("/results", async (c) => {
    const rows = await db
      .selectFrom("research")
      .selectAll()
      .orderBy("createdAt", "desc")
      .execute();

    if (!rows) {
      throw new Error("Researchs not found");
    }

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
      researchs[row.id] = await getResearchResults(row.id);
    }

    return c.json({ data: { researchs, questions } });
  })
  .get("/:id", async (c) => {
    const research = await db
      .selectFrom("research")
      .selectAll()
      .where("id", "=", c.req.param("id"))
      .executeTakeFirstOrThrow();

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
      .where("researchId", "=", research.id)
      .execute();

    const results: Record<string, Record<string, string[]>> = {};

    for (const a of answersData) {
      if (!a.answer) continue;

      results[a.projectId] ??= {};
      results[a.projectId]![a.questionId] ??= [];
      results[a.projectId]![a.questionId]!.push(a.answer);
    }

    const questions: Record<string, string> = {};
    for (const question of questionsData) {
      questions[question.id] = question.question;
    }

    return c.json({ data: { results, research, questions } });
  })
  .get("/projects/:id", async (c) => {
    const answersData = await db
      .selectFrom("surveyAnswer")
      .selectAll()
      .where("projectId", "=", c.req.param("id"))
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

      if (!results[a.questionId]![a.researchId]) {
        results[a.questionId]![a.researchId] = [];
      }

      results[a.questionId]![a.researchId]!.push(a.answer);
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

    return c.json({ data: { results, questions, researchs } });
  })
  .post("/:id/mail", authMiddleware, async (c) => {
    const research = await db
      .selectFrom("research")
      .selectAll()
      .where("id", "=", c.req.param("id"))
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
      const isAnwered = answers.some((a) => a.projectId === project.id);
      if (isAnwered || !isValidEmail) continue;

      const template = mailShareLinkTemplate(
        `${process.env.APP_BASE_URL}/project/${project.id}/survey`
      );

      await resend.emails.send({
        from: "CincoBásicos <noreply@notifications.cincobasicos.org>",
        to: project.responsibleEmail,
        subject: "Pedido de pesquisa",
        html: template,
      });
    }

    return c.json({ message: "Sucesso" });
  })
  .post(
    "/",
    authMiddleware,
    zValidator("json", setResearchSchema),
    async (c) => {
      const payload = c.req.valid("json");

      const data = await db
        .insertInto("research")
        .values({ ...payload, id: ulid() })
        .returningAll()
        .executeTakeFirst();

      return c.json({ data });
    }
  )
  .post(
    "/:id/import",
    authMiddleware,
    zValidator("form", importSchema),
    async (c) => {
      const payload = c.req.valid("form");

      let newRows = 0;
      const log: { type: string; message: string }[] = [];
      const invalidRows: string[] = [];

      const text = await payload.file.text();
      const csv = Papa.parse(text, {
        header: true,
      });

      if (!csv.data) {
        throw new Error("Invalid data");
      }

      const research = await db
        .selectFrom("research")
        .select(["surveyId", "id"])
        .where("id", "=", c.req.param("id"))
        .executeTakeFirstOrThrow();

      for (let i = 0; i < csv.data.length; i++) {
        const row = csv.data[i];

        if (row instanceof Object !== true) continue;

        const projectName = Object.values(row)[0];
        const project = await db
          .selectFrom("project")
          .select(["id"])
          .where("name", "=", projectName)
          .executeTakeFirst();

        if (!project) continue;

        for (let x = 1; x < Object.keys(row).length; x++) {
          const questionName = Object.keys(row)[x];
          if (!questionName) continue;

          const question = await db
            .selectFrom("surveyQuestion")
            .select(["id", "type"])
            .where("surveyId", "=", research.surveyId)
            .where("question", "=", questionName)
            .where("isDeleted", "=", false)
            .executeTakeFirst();

          if (!question) continue;

          const answer = Object.values(row)[x];

          if (!answer) continue;

          if (
            question.type == "number" &&
            Number.isFinite(Number(answer)) === false
          ) {
            log.push({
              type: "error",
              message: `Linha ${i}, Coluna ${x} inválida. Precisa de ser um número.`,
            });

            invalidRows.push(project.id);
            continue;
          }

          if (question.type == "boolean" && isBooleanLike(answer)) {
            log.push({
              type: "error",
              message: `Linha ${i}, Coluna ${x} inválida. Precisa de ser um true/false.`,
            });

            invalidRows.push(project.id);
            continue;
          }

          if (question.type == "select") {
            const rows =
              (await db
                .selectFrom("surveyQuestionMetadata")
                .select(["value"])
                .where("surveyQuestionId", "=", question.id)
                .execute()) ?? [];
            const options = rows.map((r) => r.value) ?? [];
            const isValid = options.includes(answer);

            if (!isValid) {
              log.push({
                type: "error",
                message: `Linha ${i}, Coluna ${x} inválida. Precisa de ser uma das seguintes respostas ("${options.join(
                  ", "
                )}").`,
              });
              invalidRows.push(project.id);
              continue;
            }
          }
        }

        if (invalidRows.includes(project.id)) continue;

        for (let x = 1; x < Object.keys(row).length; x++) {
          const questionName = Object.keys(row)[x];
          if (!questionName) continue;

          const question = await db
            .selectFrom("surveyQuestion")
            .select(["id", "type"])
            .where("surveyId", "=", research.surveyId)
            .where("question", "=", questionName)
            .where("isDeleted", "=", false)
            .executeTakeFirst();

          if (!question) continue;

          const answer = Object.values(row)[x];

          if (!answer) continue;

          const existingAnswer = await db
            .selectFrom("surveyAnswer")
            .select(["id"])
            .where("projectId", "=", project.id)
            .where("researchId", "=", research.id)
            .where("questionId", "=", question.id)
            .where("surveyId", "=", research.surveyId)
            .executeTakeFirst();

          if (existingAnswer) {
            await db
              .updateTable("surveyAnswer")
              .set({ answer: answer })
              .where("id", "=", existingAnswer.id)
              .execute();

            newRows++;
          } else {
            await db
              .insertInto("surveyAnswer")
              .values({
                id: ulid(),
                projectId: project.id,
                researchId: research.id,
                surveyId: research.surveyId,
                questionId: question.id,
                answer: answer,
              })
              .execute();

            newRows++;
          }

          if (
            !log.find((l) => l.message == `Linha ${i} atualizada com sucesso.`)
          ) {
            log.push({
              type: "success",
              message: `Linha ${i} atualizada com sucesso.`,
            });
          }
        }
      }

      return c.json({ newRows, log });
    }
  )
  .delete("/:id", authMiddleware, async (c) => {
    await db
      .updateTable("research")
      .set({ isDeleted: true })
      .where("id", "=", c.req.param("id"))
      .execute();

    return c.json({ deleted: c.req.param("id") });
  });

async function getResearchResults(id: string) {
  const research = await db
    .selectFrom("research")
    .selectAll()
    .where("id", "=", id)
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
    .where("researchId", "=", id)
    .execute();

  const results: Record<string, Record<string, string[]>> = {};

  for (const a of answersData) {
    if (!a.answer) continue;

    if (!results[a.projectId]) {
      results[a.projectId] = {};
    }

    if (!results[a.projectId]![a.questionId]) {
      results[a.projectId]![a.questionId] = [];
    }

    results[a.projectId]![a.questionId]!.push(a.answer);
  }

  const questions: Record<string, string> = {};
  for (const question of questionsData) {
    questions[question.id] = question.question;
  }

  return { results, research, questions };
}
