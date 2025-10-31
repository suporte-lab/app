import { Selectable } from "kysely";
import { DB } from "./db/types";

// Auth
export type AuthSession = {
  isAuthenticated: boolean;
  user: { id: string; nickname: string } | null;
};

// Municipalities
export type MunicipalityDTO = Selectable<DB["municipality"]>;

export type MunicipalityResponseDTO = {
  nome: string; // e.g. "Guarujá"
  codigo_ibge: string; // IBGE code as string
  codigo_uf: number; // numeric IBGE code for the state
};

export type StateResponseDTO = {
  id: number;
  sigla: string; // e.g. "SP"
  nome: string; // e.g. "São Paulo"
  regiao: {
    id: number;
    sigla: string; // e.g. "SE"
    nome: string; // e.g. "Sudeste"
  };
};

// Projects
export type ProjectDTO = Selectable<DB["project"]>;
export type CategoryDTO = Selectable<DB["projectCategory"]>;
