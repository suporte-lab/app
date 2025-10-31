import * as z from "zod";

// Utils
export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5_000_000, {
    // max 5MB
    message: "Ficheiro demasiado grande. Máximo 5MB.",
  })
  .refine((file) => ["text/csv"].includes(file.type), {
    message: "Ficheiro invalido. Apenas CSV sāo permitidos.",
  });

export function zodToFieldErrors(error: z.ZodError<unknown>) {
  const fields: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    fields[path] = issue.message;
  });

  return { fields };
}

// Auth
export const loginSchema = z.object({
  nickname: z.string().min(1, "Campo obrigatório"),
});

export type LoginParams = z.infer<typeof loginSchema>;

// Municipalities
export const setMunicipalitySchema = z.object({
  name: z.string(),
  state: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export const putMunicipalitySchema = setMunicipalitySchema.omit({});

export type PutMunicipalityParams = z.infer<typeof putMunicipalitySchema>;

// Projects
export const setProjectSchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  categoryId: z.string().min(1, "Campo obrigatório"),
  municipalityId: z.string().min(1, "Campo obrigatório"),
  responsibleName: z.string().min(1, "Campo obrigatório"),
  responsibleRole: z.string().min(1, "Campo obrigatório"),
  responsiblePhone: z.string(),
  responsibleEmail: z.email(),
  addressStreet: z.string().min(1, "Campo obrigatório"),
  addressNumber: z.string().optional(),
  addressZipCode: z.string().min(1, "Campo obrigatório"),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

export const putProjectSchema = setProjectSchema.omit({});

export type PutProjectParams = z.infer<typeof putProjectSchema>;

export const setProjectCategorySchema = z.object({
  name: z.string(),
});

export const putProjectCategorySchema = setProjectCategorySchema.omit({});

export type PutProjectCategoryParams = z.infer<typeof putProjectCategorySchema>;

// Surveys
export const setSurveySchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
});

export const putSurveySchema = setProjectCategorySchema.omit({});

export type PutSurveyParams = z.infer<typeof putSurveySchema>;

export const setSurveyQuestionSchema = z.object({
  id: z.string().optional(),
  surveyId: z.string().min(1, "Campo obrigatório"),
  question: z.string().min(1, "Campo obrigatório"),
  visibility: z.boolean().default(false),
  description: z.string().optional(),
  type: z.string().min(1, "Campo obrigatório"),
  options: z.array(z.object({ id: z.string(), value: z.string() })).optional(),
});

export const setSurveyQuestionsOrderSchema = z.object({
  questions: z.string().array(),
});

export const putSurveyQuestionSchema = setSurveyQuestionSchema.omit({});

export type PutSurveyQuestionParams = z.infer<typeof putSurveyQuestionSchema>;

export const fetchSurveyAnswersSchema = z.object({
  projectId: z.string(),
  researchId: z.string(),
});

export const setSurveyAnswerSchema = z.object({
  surveyId: z.string(),
  projectId: z.string(),
  researchId: z.string(),
  answers: z.object({ questionId: z.string(), answer: z.string() }).array(),
});

export type SetSurveyAnswerParams = z.infer<typeof setSurveyAnswerSchema>;

// Researchs
export const setResearchSchema = z.object({
  id: z.string().optional(),
  surveyId: z.string().min(1, "Campo obrigatório"),
  municipalityId: z.string().min(1, "Campo obrigatório"),
  name: z.string().min(1, "Campo obrigatório"),
  slug: z.string().min(1, "Campo obrigatório"),
});

export type SetResearchParams = z.infer<typeof setResearchSchema>;

export const importSchema = z.object({
  file: fileSchema,
});

export type ImportParams = z.infer<typeof importSchema>;
