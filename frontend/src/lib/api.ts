import { hc } from "hono/client";
import type { ApiRoutes } from "@server/app";

const client = hc<ApiRoutes>("/");

export const api = client.api;

// Municipalities
export const fetchMunicipalitiesOptions = () => ({
  queryKey: ["municipalities"],
  queryFn: async () => {
    const res = await api.municipalities.$get();
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
});

export const fetchMunicipalityOptions = (id: string) => ({
  queryKey: ["municipalities", id],
  queryFn: async () => {
    const res = await api.municipalities[":id"].$get({ param: { id } });
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
  enabled: !!id,
});

// Projects
export const fetchProjectsOptions = () => ({
  queryKey: ["projects"],
  queryFn: async () => {
    const res = await api.projects.$get();
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
});

export const fetchProjectOptions = (id: string) => ({
  queryKey: ["projects", id],
  queryFn: async () => {
    const res = await api.projects[":id"].$get({ param: { id } });
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
  enabled: !!id,
});

export const fetchCategoriesOptions = () => ({
  queryKey: ["categories"],
  queryFn: async () => {
    const res = await api.categories.$get();
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
});

export const fetchCategoryOptions = (id: string) => ({
  queryKey: ["categories", id],
  queryFn: async () => {
    const res = await api.categories[":id"].$get({ param: { id } });
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
  enabled: !!id,
});

// Surveys
export const fetchSurveysOptions = () => ({
  queryKey: ["surveys"],
  queryFn: async () => {
    const res = await api.surveys.$get();
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
});

export const fetchSurveyOptions = (id: string) => ({
  queryKey: ["surveys", id],
  queryFn: async () => {
    const res = await api.surveys[":id"].$get({ param: { id } });
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
  enabled: !!id,
});

export const fetchSurveyQuestionsOptions = (id: string) => ({
  queryKey: ["surveys", id, "questions"],
  queryFn: async () => {
    const res = await api.surveys[":id"].questions.$get({ param: { id } });
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
  enabled: !!id,
});

export const fetchSurveysQuestionsOptions = () => ({
  queryKey: ["surveys", "questions"],
  queryFn: async () => {
    const res = await api.surveys.questions.$get();
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
});

export const fetchSurveyAnswersOptions = (data: {
  surveyId: string;
  projectId: string;
  researchId: string;
}) => ({
  queryKey: [
    "surveys",
    data.surveyId,
    data.projectId,
    data.researchId,
    "answers",
  ],
  queryFn: async () => {
    const res = await api.surveys[":id"].answers.$get({
      param: { id: data.surveyId },
      query: { ...data },
    });
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
  enabled: !!data.surveyId && !!data.projectId && !!data.researchId,
});

// Researchs
export const fetchResearchsOptions = () => ({
  queryKey: ["researchs"],
  queryFn: async () => {
    const res = await api.researchs.$get();
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
});

export const fetchResearchsResultsOptions = () => ({
  queryKey: ["researchs", "results"],
  queryFn: async () => {
    const res = await api.researchs.results.$get();
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
});

export const fetchProjectResearchsOptions = (id: string) => ({
  queryKey: ["researchs", "projects", id],
  queryFn: async () => {
    const res = await api.researchs.projects[":id"].$get({ param: { id } });
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
});

export const fetchResearchOptions = (id: string) => ({
  queryKey: ["researchs", id],
  queryFn: async () => {
    const res = await api.researchs[":id"].$get({ param: { id } });
    if (!res.ok) throw new Error("server error");
    return (await res.json()).data;
  },
});
