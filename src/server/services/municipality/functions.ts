import { db } from "@/server/db";
import { createServerFn } from "@tanstack/react-start";
import { setMunicipalitySchema } from "./schemas";
import { idSchema } from "@/server/utils/schemas";
import { queryOptions } from "@tanstack/react-query";
import { MunicipalityResponseDTO, StateResponseDTO } from "./types";
import z from "zod";
import {
  getMunicipalitiesList,
  getMunicipality,
  softDeleteMunicipality,
  setMunicipality,
  fetchMunicipalities,
  fetchStates,
} from "./server";

export const getMunicipalityFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await getMunicipality(db, data);
  });

export const getMunicipalitiesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return await getMunicipalitiesList(db);
  }
);

export const setMunicipalityFn = createServerFn({ method: "POST" })
  .validator(setMunicipalitySchema())
  .handler(async ({ data }) => {
    return await setMunicipality(db, data);
  });

export const deleteMunicipalityFn = createServerFn({ method: "POST" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await softDeleteMunicipality(db, data);
  });

// External API
export const fetchMunicipalitiesFn = createServerFn({ method: "GET" })
  .validator(idSchema())
  .handler(async ({ data }) => {
    return await fetchMunicipalities(data);
  });

export const fetchStatesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return await fetchStates();
  }
);
