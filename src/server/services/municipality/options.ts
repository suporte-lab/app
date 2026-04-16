import { idSchema } from "@/server/utils/schemas";
import { queryOptions } from "@tanstack/react-query";
import {
  getMunicipalityFn,
  getMunicipalitiesFn,
  fetchMunicipalitiesFn,
  fetchStatesFn,
} from "./functions";
import z from "zod";

export const getMunicipalitiesOptions = () =>
  queryOptions({
    queryKey: ["municipalities"],
    queryFn: () => getMunicipalitiesFn(),
  });

export const getMunicipalityOptions = (
  data: z.infer<ReturnType<typeof idSchema>>
) =>
  queryOptions({
    queryKey: ["municipalities", data.id],
    queryFn: () => getMunicipalityFn({ data }),
    enabled: !!data.id,
  });

export const fetchStatesOptions = () =>
  queryOptions({ queryKey: ["state-api"], queryFn: fetchStatesFn });

export const fetchMunicipalitiesOptions = (
  data: z.infer<ReturnType<typeof idSchema>>
) =>
  queryOptions({
    queryKey: ["municipality-api", data.id],
    queryFn: () => fetchMunicipalitiesFn({ data }),
    enabled: !!data.id,
  });
