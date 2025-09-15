import { db } from "@/server/db";
import { createServerFn } from "@tanstack/react-start";
import { idSchema } from "@/server/utils/schemas";
import {
  setResearchSchema,
  setSurveyQuestionSchema,
  setSurveyQuestionsOrderSchema,
  setSurveySchema,
  setSurveyAnswerSchema,
  getSurveyAnswersByProjectIdSchema,
} from "./schemas";
import {
  getResearch,
  getResearchBySlug,
  getResearchsList,
  getSurvey,
  getSurveyQuestion,
  getSurveyQuestions,
  getSurveysList,
  setResearch,
  setSurvey,
  setSurveyQuestion,
  softDeleteResearch,
  softDeleteSurvey,
  setSurveyQuestionsOrder,
  softDeleteSurveyQuestion,
  setSurveyAnswer,
  getResearchResults,
  getSurveyAnswersByProjectId,
  getResearchResultsByProjectId,
  getResearchsResultsList,
  getQuestionsList,
  sendResearchRequestEmail,
} from "./server";

// Research
export const sendResearchRequestEmailFn = createServerFn({
  method: "POST",
})
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await sendResearchRequestEmail(data, db);
  });

export const getResearchBySlugFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await getResearchBySlug(db, data);
  });

export const getResearchResultsByProjectIdFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await getResearchResultsByProjectId(db, data);
  });

export const getResearchResultsFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await getResearchResults(db, data);
  });

export const getResearchFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await getResearch(db, data);
  });

export const getResearchsListFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return await getResearchsList(db);
  }
);

export const getResearchsResultsListFn = createServerFn({
  method: "GET",
}).handler(async () => {
  return await getResearchsResultsList(db);
});

export const setResearchFn = createServerFn({ method: "POST" })
  .validator(setResearchSchema())
  .handler(async ({ data }) => {
    return await setResearch(db, data);
  });

export const softDeleteResearchFn = createServerFn({ method: "POST" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await softDeleteResearch(db, data);
  });

// Survey

export const getSurveysListFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return await getSurveysList(db);
  }
);

export const getSurveyFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await getSurvey(db, data);
  });

export const setSurveyFn = createServerFn({ method: "POST" })
  .validator(setSurveySchema())
  .handler(async ({ data }) => {
    return await setSurvey(db, data);
  });

export const softDeleteSurveyFn = createServerFn({ method: "POST" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await softDeleteSurvey(db, data);
  });

// Survey Question
export const getSurveyQuestionFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await getSurveyQuestion(db, data);
  });

export const getSurveyQuestionsFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await getSurveyQuestions(db, data);
  });

export const setSurveyQuestionFn = createServerFn({ method: "POST" })
  .validator(setSurveyQuestionSchema())
  .handler(async ({ data }) => {
    return await setSurveyQuestion(db, data);
  });

export const setSurveyQuestionsOrderFn = createServerFn({ method: "POST" })
  .validator(setSurveyQuestionsOrderSchema())
  .handler(async ({ data }) => {
    return await setSurveyQuestionsOrder(db, data);
  });

export const softDeleteSurveyQuestionFn = createServerFn({ method: "POST" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await softDeleteSurveyQuestion(db, data);
  });

// Survey Answer
export const getSurveyAnswersByProjectIdFn = createServerFn({ method: "GET" })
  .validator(getSurveyAnswersByProjectIdSchema())
  .handler(async ({ data }) => {
    return await getSurveyAnswersByProjectId(db, data);
  });

export const setSurveyAnswerFn = createServerFn({ method: "POST" })
  .validator(setSurveyAnswerSchema())
  .handler(async ({ data }) => {
    return await setSurveyAnswer(db, data);
  });

export const getQuestionsListFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return await getQuestionsList(db);
  }
);
