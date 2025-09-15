import { Selectable } from "kysely";
import { DB } from "@/server/db/types";

export type SessionDTO = {
  id: string;
  userId: string;
  secretHash: Buffer;
  createdAt: Date;
};

export type UserDTO = Selectable<DB["user"]>;
