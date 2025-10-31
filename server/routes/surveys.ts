import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import {
  fetchSurveyAnswersSchema,
  putSurveySchema,
  setSurveyAnswerSchema,
  setSurveyQuestionSchema,
  setSurveyQuestionsOrderSchema,
  setSurveySchema,
} from "../schemas";
import { authMiddleware } from "./auth";
import { ulid } from "ulid";

export const surveysRoute = new Hono()
  .get("/", async (c) => {
    const data = await db
      .selectFrom("survey")
      .selectAll()
      .where("isDeleted", "!=", true)
      .execute();

    return c.json({ data });
  })
  .get("/questions", async (c) => {
    const data = await db.selectFrom("surveyQuestion").selectAll().execute();
    return c.json({ data });
  })
  .get("/:id", async (c) => {
    const data = await db
      .selectFrom("survey")
      .selectAll()
      .where("id", "=", c.req.param("id"))
      .where("isDeleted", "!=", true)
      .executeTakeFirstOrThrow();

    return c.json({ data });
  })
  .get("/:id/questions", async (c) => {
    const rows = await db
      .selectFrom("surveyQuestion")
      .selectAll()
      .where("surveyId", "=", c.req.param("id"))
      .where("isDeleted", "=", false)
      .orderBy("position")
      .execute();

    if (!rows.length) return c.json({ data: [] });

    const metadata = await db
      .selectFrom("surveyQuestionMetadata")

      .selectAll()
      .where(
        "surveyQuestionId",
        "in",
        rows.map((r) => r.id)
      )
      .where("isDeleted", "=", false)
      .orderBy("position")
      .execute();

    const data = rows.map((r) => ({
      ...r,
      metadata: metadata.filter((m) => m.surveyQuestionId === r.id) ?? [],
    }));

    return c.json({ data });
  })
  .get(
    "/:id/answers",
    zValidator("query", fetchSurveyAnswersSchema),
    async (c) => {
      const payload = c.req.valid("query");

      const data = await db
        .selectFrom("surveyAnswer")
        .selectAll()
        .where("surveyId", "=", c.req.param("id"))
        .where("researchId", "=", payload.researchId)
        .where("projectId", "=", payload.projectId)
        .execute();

      return c.json({ data });
    }
  )
  .post("/", authMiddleware, zValidator("json", setSurveySchema), async (c) => {
    const payload = c.req.valid("json");

    const data = await db
      .insertInto("survey")
      .values({ ...payload, id: ulid() })
      .returningAll()
      .executeTakeFirst();

    return c.json({ data });
  })
  .post(
    "/:id/questions/order",
    authMiddleware,
    zValidator("json", setSurveyQuestionsOrderSchema),
    async (c) => {
      const payload = c.req.valid("json");

      for (let i = 0; i < payload.questions.length; i++) {
        const questionId = payload.questions[i];
        console.log(i, questionId);
        if (!questionId) continue;

        await db
          .updateTable("surveyQuestion")
          .set({ position: i })
          .where("id", "=", questionId)
          .execute();
      }

      return c.json({ message: "Sucesso" });
    }
  )
  .post(
    "/:id/questions",
    authMiddleware,
    zValidator("json", setSurveyQuestionSchema),
    async (c) => {
      const payload = c.req.valid("json");
      let questionId: string | null = null;

      if (payload.type === "select" && !payload.options?.length) {
        return c.json({ message: "Select questions must have options" }, 400);
      }

      if (payload.id) {
        const row = await db
          .updateTable("surveyQuestion")
          .set({
            surveyId: payload.surveyId,
            question: payload.question,
            description: payload.description,
            type: payload.type,
            isPublic: payload.visibility,
          })
          .where("id", "=", payload.id)
          .returningAll()
          .executeTakeFirstOrThrow();

        questionId = row.id;
      } else {
        const row = await db
          .insertInto("surveyQuestion")
          .values({
            id: ulid(),
            surveyId: payload.surveyId,
            question: payload.question,
            description: payload.description,
            type: payload.type,
            position: 999,
            isPublic: payload.visibility,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        questionId = row.id;
      }

      if (!questionId) {
        return c.json({ message: "Failed to create question" }, 500);
      }

      if (payload.type === "select" && payload.options?.length) {
        const existingOptions = await db
          .selectFrom("surveyQuestionMetadata")
          .selectAll()
          .where("surveyQuestionId", "=", questionId)
          .where("type", "=", "select-option")
          .execute();

        for (const opt of existingOptions) {
          if (!payload.options.find((o) => o.id === opt.id)) {
            await db
              .updateTable("surveyQuestionMetadata")
              .set({ isDeleted: true })
              .where("id", "=", opt.id)
              .execute();
          }
        }

        for (let i = 0; i < payload.options.length; i++) {
          const option = payload.options[i];
          if (!option) continue;

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

      const data = await db
        .selectFrom("surveyQuestion")
        .selectAll()
        .where("id", "=", questionId)
        .executeTakeFirstOrThrow();

      return c.json({ data });
    }
  )
  .post(
    "/:id/answers",
    zValidator("json", setSurveyAnswerSchema),
    async (c) => {
      const payload = c.req.valid("json");

      for (const answer of payload.answers) {
        const existingAnswer = await db
          .selectFrom("surveyAnswer")
          .selectAll()
          .where("researchId", "=", payload.researchId)
          .where("projectId", "=", payload.projectId)
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
            surveyId: payload.surveyId,
            projectId: payload.projectId,
            researchId: payload.researchId,
            questionId: answer.questionId,
            answer: answer.answer,
          })
          .execute();
      }

      return c.json({ message: "Sucesso" });
    }
  )
  .put(
    "/:id",
    authMiddleware,
    zValidator("json", putSurveySchema),
    async (c) => {
      const payload = c.req.valid("json");

      const data = await db
        .updateTable("survey")
        .set({ ...payload, isDeleted: false })
        .where("id", "=", c.req.param("id"))
        .returningAll()
        .executeTakeFirst();

      return c.json({ data });
    }
  )
  .delete("/:id", authMiddleware, async (c) => {
    await db
      .updateTable("survey")
      .set({ isDeleted: true })
      .where("id", "=", c.req.param("id"))
      .execute();

    return c.json({ deleted: c.req.param("id") });
  })
  .delete("/:id/questions", authMiddleware, async (c) => {
    await db
      .updateTable("surveyQuestion")
      .set({ isDeleted: true })
      .where("id", "=", c.req.param("id"))
      .execute();

    return c.json({ deleted: c.req.param("id") });
  });
