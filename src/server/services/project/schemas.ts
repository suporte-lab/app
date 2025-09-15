import z from "zod";

export const getProjectsListSchema = () =>
  z.object({
    categoryId: z.string().optional(),
    municipalityId: z.string().optional(),
  });

export const setProjectSchema = () =>
  z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    categoryId: z.string().min(1, "Category is required"),
    municipalityId: z.string().min(1, "Municipality is required"),
    responsibleName: z.string().min(1, "Responsible name is required"),
    responsibleRole: z.string().min(1, "Responsible role is required"),
    responsiblePhone: z.string(),
    responsibleEmail: z.email(),
    addressStreet: z.string().min(1, "Street is required"),
    addressNumber: z.string().optional(),
    addressZipCode: z.string().min(1, "Zip code is required"),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
  });

export const setProjectCategorySchema = () =>
  z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
  });
