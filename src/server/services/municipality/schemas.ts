import z from "zod";

export const setMunicipalitySchema = () =>
  z.object({
    name: z.string().min(1, "Missing name"),
    state: z.string().min(1, "Missing state"),
    latitude: z.number(),
    longitude: z.number(),
  });

export const fetchMunicipalityCordsSchema = () =>
  z.object({
    name: z.string().min(1, "Missing name"),
    state: z.string().min(1, "Missing state"),
  });
