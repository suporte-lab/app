import z from "zod";

export const setResearchSchema = () =>
  z.object({
    id: z.string().optional(),
    surveyId: z.string().min(1, "Survey is required"),
    municipalityId: z.string().min(1, "Municipality is required"),
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
  });

export const setSurveySchema = () =>
  z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
  });

export const setSurveyQuestionSchema = () =>
  z.object({
    id: z.string().optional(),
    surveyId: z.string().min(1, "Survey is required"),
    question: z.string().min(1, "Question is required"),
    visibility: z.boolean().default(false),
    description: z.string().optional(),
    type: z.string().min(1, "Type is required"),
    options: z
      .array(z.object({ id: z.string(), value: z.string() }))
      .optional(),
  });

export const setSurveyQuestionsOrderSchema = () =>
  z.object({
    surveyId: z.string(),
    questions: z.string().array(),
  });

export const getSurveyAnswersByProjectIdSchema = () =>
  z.object({
    researchId: z.string(),
    projectId: z.string(),
  });

export const setSurveyAnswerSchema = () =>
  z.object({
    surveyId: z.string(),
    projectId: z.string(),
    researchId: z.string(),
    answers: z.object({ questionId: z.string(), answer: z.string() }).array(),
  });
