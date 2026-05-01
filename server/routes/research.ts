import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { importSchema, setResearchSchema } from "../schemas";
import { authMiddleware } from "./auth";
import { ulid } from "ulid";
import { mailShareLinkTemplate, resend, validateEmail } from "../services/mail";
import { getColumnLetter, isBooleanLike } from "../../frontend/src/lib/utils";
import Papa from "papaparse";
import { formatDate } from "date-fns";
import { parse } from "date-fns/parse";

export const researchsRoute = new Hono()
  .get("/", async (c) => {
    const data = await db
      .selectFrom("research")
      .selectAll()
      .where("isDeleted", "!=", true)
      .orderBy("createdAt", "desc")
      .execute();

    return c.json({ data });
  })
  .get("/results", async (c) => {
    const questions: Record<string, string> = {};
    const researchs: Record<
      string,
      Awaited<ReturnType<typeof getResearchResults>>
    > = {};

    const rows = await db
      .selectFrom("research")
      .selectAll()
      .orderBy("createdAt", "desc")
      .execute();

    console.log(rows);

    if (!rows) {
      return c.json({ data: { researchs, questions } });
    }

    let query = db
      .selectFrom("surveyQuestion")
      .selectAll()
      .where("isDeleted", "=", false)
      .orderBy("position");

    if (rows.length > 0) {
      query = query.where(
        "surveyId",
        "in",
        rows.map((r) => r.surveyId)
      );
    }

    const questionsData = await query.execute();

    for (const question of questionsData) {
      questions[question.id] = question.question;
    }

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

      results[a.projectId]!["createdAt"] = [a.createdAt.toISOString()];
    }

    const sortedResults = Object.fromEntries(
      Object.entries(results).sort(([, a], [, b]) => {
        const dateA = new Date(a.createdAt?.[0] ?? 0).getTime();
        const dateB = new Date(b.createdAt?.[0] ?? 0).getTime();
        return dateB - dateA; // newest first
      })
    );

    const questions: Record<string, string> = {};
    for (const question of questionsData) {
      questions[question.id] = question.question;
    }

    return c.json({ data: { results: sortedResults, research, questions } });
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
  .get("/municipality/:id/export", authMiddleware, async (c) => {
    const municipalityId = c.req.param("id");

    const municipality = await db
      .selectFrom("municipality")
      .select(["name"])
      .where("id", "=", municipalityId)
      .executeTakeFirst();

    const projects = await db
      .selectFrom("project")
      .select(["id", "name"])
      .where("municipalityId", "=", municipalityId)
      .execute();

    const projectIds = projects.map((project) => project.id);

    const answersData = projectIds.length
      ? await db
          .selectFrom("surveyAnswer")
          .selectAll()
          .where("projectId", "in", projectIds)
          .execute()
      : [];

    const researchIds = Array.from(
      new Set(answersData.map((answer) => answer.researchId))
    );

    const researchsData = researchIds.length
      ? await db
          .selectFrom("research")
          .select(["id", "name", "surveyId", "createdAt"])
          .where("id", "in", researchIds)
          .where("isDeleted", "=", false)
          .execute()
      : [];

    // Group researches by survey to get questions per research
    const researchGroups = new Map<string, typeof researchsData>();

    for (const research of researchsData) {
      if (!researchGroups.has(research.surveyId)) {
        researchGroups.set(research.surveyId, []);
      }
      researchGroups.get(research.surveyId)!.push(research);
    }

    // Get all questions for all surveys
    const surveyIds = Array.from(researchGroups.keys());
    const questionsData = surveyIds.length
      ? await db
          .selectFrom("surveyQuestion")
          .select(["id", "question", "surveyId", "position"])
          .where("surveyId", "in", surveyIds)
          .where("isDeleted", "=", false)
          .orderBy("surveyId")
          .orderBy("position")
          .execute()
      : [];

    const projectsById = Object.fromEntries(
      projects.map((project) => [project.id, project.name])
    );

    // Create separate CSV for each research
    const csvFiles: { filename: string; content: string }[] = [];

    for (const research of researchsData) {
      const researchQuestions = questionsData.filter(
        (q) => q.surveyId === research.surveyId
      );

      const researchAnswers = answersData.filter(
        (a) => a.researchId === research.id
      );

      // Group answers by project
      const projectAnswers = new Map<string, {
        project: string;
        createdAt: Date;
        answers: Record<string, string[]>;
      }>();

      for (const answer of researchAnswers) {
        if (!answer.answer) continue;

        const project = projectsById[answer.projectId];
        if (!project) continue;

        const existing = projectAnswers.get(answer.projectId);
        const answerCreatedAt = new Date(answer.createdAt);

        if (!existing) {
          projectAnswers.set(answer.projectId, {
            project,
            createdAt: answerCreatedAt,
            answers: {
              [answer.questionId]: [answer.answer],
            },
          });
        } else {
          existing.createdAt =
            answerCreatedAt.getTime() > existing.createdAt.getTime()
              ? answerCreatedAt
              : existing.createdAt;

          const answersForQuestion = existing.answers[answer.questionId] ?? [];
          answersForQuestion.push(answer.answer);
          existing.answers[answer.questionId] = answersForQuestion;
        }
      }

      const fields = [
        { label: "Município", value: "municipality" },
        { label: "Projeto", value: "project" },
        { label: "Data de envio", value: "createdAt" },
        ...researchQuestions.map((question) => ({
          label: question.question,
          value: question.id,
        })),
      ];

      const output = Array.from(projectAnswers.values()).map((row) => {
        const normalized: Record<string, string> = {
          municipality: municipality?.name ?? "",
          project: row.project,
          createdAt: formatDate(row.createdAt, "dd-MM-yyyy"),
        };

        for (const question of researchQuestions) {
          normalized[question.id] =
            row.answers[question.id]?.join(", ").trim() ?? "";
        }

        return normalized;
      });

      const escapeCsv = (value: unknown) => {
        if (value == null) return "";
        const str = String(value);
        if (/[",\n]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const header = fields.map((field) => escapeCsv(field.label)).join(",") + "\n";
      const rowsCsv = output
        .map((row) =>
          fields
            .map((field) => escapeCsv(row[field.value] ?? ""))
            .join(",")
        )
        .join("\n");

      const csv = header + rowsCsv;

      csvFiles.push({
        filename: `${research.name.replace(/[^a-zA-Z0-9]/g, "_")}.csv`,
        content: csv,
      });
    }

    // Create combined CSV with all questions
    const allQuestions = questionsData.sort((a, b) => {
      // Sort by survey, then by position
      if (a.surveyId !== b.surveyId) {
        return a.surveyId.localeCompare(b.surveyId);
      }
      return a.position - b.position;
    });

    const combinedFields = [
      { label: "Município", value: "municipality" },
      { label: "Projeto", value: "project" },
      { label: "Pesquisa", value: "research" },
      { label: "Data de envio", value: "createdAt" },
      ...allQuestions.map((question) => ({
        label: question.question,
        value: question.id,
      })),
    ];

    // Group all answers by project-research combination
    const combinedRows = new Map<string, {
      municipality: string;
      project: string;
      research: string;
      createdAt: Date;
      answers: Record<string, string[]>;
    }>();

    for (const answer of answersData) {
      if (!answer.answer) continue;

      const project = projectsById[answer.projectId];
      const research = researchsData.find((r) => r.id === answer.researchId);
      if (!project || !research) continue;

      const rowKey = `${answer.projectId}-${answer.researchId}`;
      const existing = combinedRows.get(rowKey);
      const answerCreatedAt = new Date(answer.createdAt);

      if (!existing) {
        combinedRows.set(rowKey, {
          municipality: municipality?.name ?? "",
          project,
          research: research.name,
          createdAt: answerCreatedAt,
          answers: {
            [answer.questionId]: [answer.answer],
          },
        });
      } else {
        existing.createdAt =
          answerCreatedAt.getTime() > existing.createdAt.getTime()
            ? answerCreatedAt
            : existing.createdAt;

        const answersForQuestion = existing.answers[answer.questionId] ?? [];
        answersForQuestion.push(answer.answer);
        existing.answers[answer.questionId] = answersForQuestion;
      }
    }

    // Sort combined rows by research name, then by created date (newest first)
    const sortedCombinedRows = Array.from(combinedRows.values()).sort((a, b) => {
      const researchCompare = a.research.localeCompare(b.research);
      if (researchCompare !== 0) return researchCompare;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const combinedOutput = sortedCombinedRows.map((row) => {
      const normalized: Record<string, string> = {
        municipality: row.municipality,
        project: row.project,
        research: row.research,
        createdAt: formatDate(row.createdAt, "dd-MM-yyyy"),
      };

      for (const question of allQuestions) {
        normalized[question.id] =
          row.answers[question.id]?.join(", ").trim() ?? "";
      }

      return normalized;
    });

    const escapeCsv = (value: unknown) => {
      if (value == null) return "";
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const combinedHeader = combinedFields.map((field) => escapeCsv(field.label)).join(",") + "\n";
    const combinedRowsCsv = combinedOutput
      .map((row) =>
        combinedFields
          .map((field) => escapeCsv(row[field.value] ?? ""))
          .join(",")
      )
      .join("\n");

    const combinedCsv = combinedHeader + combinedRowsCsv;

    // Return only the combined CSV
    return c.body(combinedCsv, 200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="todas_pesquisas_${municipality?.name?.replace(/[^a-zA-Z0-9]/g, "_") ?? "municipio"}.csv"`,
    });
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
        const rowNumber = i + 2;
        const row = csv.data[i] as Record<string, string>;

        if (row instanceof Object !== true) continue;

        const projectName = Object.values(row)[0];
        if (!projectName) continue;

        const project = await db
          .selectFrom("project")
          .select(["id"])
          .where("name", "=", projectName)
          .executeTakeFirst();

        if (!project) continue;

        const createdAt = row["Data (01-01-1111)"]
          ? parse(row["Data (01-01-1111)"], "dd-MM-yyyy", new Date())
          : new Date();

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
              message: `Linha ${rowNumber}, Coluna ${getColumnLetter(x)} inválida. Precisa de ser um número.`,
            });

            invalidRows.push(project.id);
            continue;
          }

          if (question.type == "boolean" && isBooleanLike(answer)) {
            log.push({
              type: "error",
              message: `Linha ${rowNumber}, Coluna ${getColumnLetter(x)} inválida. Precisa de ser um true/false.`,
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
                message: `Linha ${rowNumber}, Coluna ${getColumnLetter(x)} inválida. Precisa de ser uma das seguintes respostas ("${options.join(
                  ", "
                )}").`,
              });
              invalidRows.push(project.id);
              continue;
            }
          }

          console.log(question.type);

          if (question.type === "select-multi") {
            // Split the answer into an array
            const selectedValues = answer
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean); // remove empty strings

            // Get allowed options from DB
            const rows =
              (await db
                .selectFrom("surveyQuestionMetadata")
                .select(["value"])
                .where("surveyQuestionId", "=", question.id)
                .execute()) ?? [];
            const options = rows.map((r) => r.value) ?? [];

            // Check if every selected value is valid
            const invalidValues = selectedValues.filter(
              (v) => !options.includes(v)
            );

            if (invalidValues.length > 0) {
              log.push({
                type: "error",
                message: `Linha ${rowNumber}, Coluna ${getColumnLetter(
                  x
                )} inválida. Valores inválidos: "${invalidValues.join(
                  ", "
                )}". Devem ser um dos seguintes: "${options.join(", ")}".`,
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
              .set({ answer: answer, createdAt })
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
                createdAt,
              })
              .execute();

            newRows++;
          }

          if (
            !log.find(
              (l) => l.message == `Linha ${rowNumber} atualizada com sucesso.`
            )
          ) {
            log.push({
              type: "success",
              message: `Linha ${rowNumber} atualizada com sucesso.`,
            });
          }
        }
      }

      return c.json({ newRows, log });
    }
  )
  .put(
    "/:id",
    authMiddleware,
    zValidator("json", setResearchSchema),
    async (c) => {
      const payload = c.req.valid("json");

      console.log(payload);

      const data = await db
        .updateTable("research")
        .set({ ...payload })
        .where("id", "=", c.req.param("id"))
        .returningAll()
        .executeTakeFirst();

      return c.json({ data });
    }
  )
  .delete("/:id", authMiddleware, async (c) => {
    await db
      .deleteFrom("research")
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
