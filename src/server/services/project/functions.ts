import { db } from "@/server/db";
import { createServerFn } from "@tanstack/react-start";
import {
  getProjectsListSchema,
  setProjectCategorySchema,
  setProjectSchema,
} from "./schemas";
import { idSchema } from "@/server/utils/schemas";
import {
  getProject,
  getProjectCategories,
  getProjectCategory,
  getProjectResearchs,
  getProjectsList,
  setProject,
  setProjectCategory,
  setProjectsImport,
  softDeleteProject,
  softDeleteProjectCategory,
} from "./server";

export const getProjectsListFn = createServerFn({ method: "GET" })
  .validator(getProjectsListSchema())
  .handler(async ({ data }) => {
    return await getProjectsList(db, data);
  });

export const getProjectFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await getProject(db, data);
  });

export const getProjectResearchsFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await getProjectResearchs(db, data);
  });

export const setProjectFn = createServerFn({ method: "POST" })
  .validator(setProjectSchema())
  .handler(async ({ data }) => {
    return await setProject(db, data);
  });

export const setProjectImportFn = createServerFn({ method: "POST" })
  .validator((data) => {
    if (data instanceof FormData) {
      const id = String(data.get("id"))
      const file = data.get("file")

      if (file instanceof File) {
        return { id, file }
      }
    }
    throw new Error("Invalid data")

  })
  .handler(async ({ data }) => {
    return await setProjectsImport(db, data);
  });

export const softDeleteProjectFn = createServerFn({ method: "POST" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await softDeleteProject(db, data);
  });

// Categories
export const getProjectCategoryFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await getProjectCategory(db, data);
  });

export const getProjectCategoriesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return await getProjectCategories(db);
  }
);

export const setProjectCategoryFn = createServerFn({ method: "POST" })
  .validator(setProjectCategorySchema())
  .handler(async ({ data }) => {
    return await setProjectCategory(db, data);
  });

export const softDeleteProjectCategoryFn = createServerFn({ method: "POST" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await softDeleteProjectCategory(db, data);
  });
