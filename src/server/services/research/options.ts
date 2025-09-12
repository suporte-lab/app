import { idSchema } from "@/server/utils/schemas";
import { queryOptions } from "@tanstack/react-query";
import {
  getResearchBySlugFn,
  getResearchResultsByProjectIdFn,
  getResearchResultsFn,
  getResearchsListFn,
  getResearchsResultsListFn,
  getSurveyAnswersByProjectIdFn,
  getSurveyFn,
  getSurveyQuestionFn,
  getSurveyQuestionsFn,
  getSurveysListFn,
  getQuestionsListFn,
} from "./functions";
import { getResearchFn } from "./functions";
import z from "zod";
import { getSurveyAnswersByProjectIdSchema } from "./schemas";

// Research
export const getResearchBySlugOptions = (
  data: z.infer<ReturnType<typeof idSchema>>
) =>
  queryOptions({
    queryKey: ["researchs", data.id],
    queryFn: () => getResearchBySlugFn({ data }),
  });

export const getResearchResultsByProjectIdOptions = (
  data: z.infer<ReturnType<typeof idSchema>>
) =>
  queryOptions({
    queryKey: ["researchs", "projects", data.id],
    queryFn: () => getResearchResultsByProjectIdFn({ data }),
  });
export const getResearchOptions = (
  data: z.infer<ReturnType<typeof idSchema>>
) =>
  queryOptions({
    queryKey: ["researchs", data.id],
    queryFn: () => getResearchFn({ data }),
  });

export const getResearchsListOptions = () =>
  queryOptions({
    queryKey: ["researchs", "list"],
    queryFn: getResearchsListFn,
  });

export const getResearchsResultsListOptions = () =>
  queryOptions({
    queryKey: ["researchs", "results", "list"],
    queryFn: getResearchsResultsListFn,
  });

export const getResearchResultsOptions = (
  data: z.infer<ReturnType<typeof idSchema>>
) =>
  queryOptions({
    queryKey: ["researchs", data.id, "results"],
    queryFn: () => getResearchResultsFn({ data }),
  });

// Survey
export const getSurveysListOptions = () =>
  queryOptions({
    queryKey: ["surveys", "list"],
    queryFn: getSurveysListFn,
  });

export const getSurveyOptions = (data: z.infer<ReturnType<typeof idSchema>>) =>
  queryOptions({
    queryKey: ["surveys", data.id],
    queryFn: () => getSurveyFn({ data }),
  });

// Question
export const getQuestionsListOptions = () =>
  queryOptions({
    queryKey: ["questions", "list"],
    queryFn: () => getQuestionsListFn(),
  });

export const getSurveyQuestionsOptions = (
  data: z.infer<ReturnType<typeof idSchema>>
) =>
  queryOptions({
    queryKey: ["survey", data.id, "questions"],
    queryFn: () => getSurveyQuestionsFn({ data }),
  });

export const getSurveyQuestionOptions = (
  surveyId: string,
  questionId: string
) =>
  queryOptions({
    queryKey: ["survey", surveyId, "questions", questionId],
    queryFn: () => getSurveyQuestionFn({ data: { id: questionId } }),
    enabled: !!questionId,
  });

// Answer
export const getSurveyAnswersByProjectIdOptions = (
  data: z.infer<ReturnType<typeof getSurveyAnswersByProjectIdSchema>>
) =>
  queryOptions({
    queryKey: ["survey", data.researchId, "answers", data.projectId],
    queryFn: () => getSurveyAnswersByProjectIdFn({ data }),
  });
