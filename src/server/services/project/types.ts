import { DB } from "@/server/db/types";
import { Selectable } from "kysely";

export type ProjectDTO = Selectable<DB["project"]>;
export type ProjectCategoryDTO = Selectable<DB["projectCategory"]>;
