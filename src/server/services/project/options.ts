import { queryOptions } from "@tanstack/react-query";
import { getProjectsListSchema } from "./schemas";
import {
  getProjectCategoriesFn,
  getProjectCategoryFn,
  getProjectFn,
  getProjectsListFn,
  getProjectResearchsFn,
} from "./functions";
import z from "zod";
import { idSchema } from "@/server/utils/schemas";

export const getProjectsListOptions = (
  data: z.infer<ReturnType<typeof getProjectsListSchema>>
) =>
  queryOptions({
    queryKey: ["projects", "list", data],
    queryFn: () => getProjectsListFn({ data }),
  });

export const getProjectOptions = (data: z.infer<ReturnType<typeof idSchema>>) =>
  queryOptions({
    queryKey: ["projects", data.id],
    queryFn: () => getProjectFn({ data }),
    enabled: !!data.id,
  });

export const getProjectResearchsOptions = (
  data: z.infer<ReturnType<typeof idSchema>>
) =>
  queryOptions({
    queryKey: ["projects", data.id, "researchs"],
    queryFn: () => getProjectResearchsFn({ data }),
    enabled: !!data.id,
  });

export const getProjectCategoriesOptions = () =>
  queryOptions({
    queryKey: ["project-categories"],
    queryFn: () => getProjectCategoriesFn(),
  });

export const getProjectCategoryOptions = (
  data: z.infer<ReturnType<typeof idSchema>>
) =>
  queryOptions({
    queryKey: ["project-categories", data.id],
    queryFn: () => getProjectCategoryFn({ data }),
    enabled: !!data.id,
  });
