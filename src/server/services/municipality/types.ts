import { DB } from "@/server/db/types";
import { Selectable } from "kysely";

export type MunicipalityDTO = Selectable<DB["municipality"]>;

export interface MunicipalityResponseDTO {
  nome: string; // e.g. "Guarujá"
  codigo_ibge: string; // IBGE code as string
  codigo_uf: number; // numeric IBGE code for the state
}

export interface StateResponseDTO {
  id: number;
  sigla: string; // e.g. "SP"
  nome: string; // e.g. "São Paulo"
  regiao: {
    id: number;
    sigla: string; // e.g. "SE"
    nome: string; // e.g. "Sudeste"
  };
}
