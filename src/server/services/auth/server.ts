import { DB } from "@/server/db/types";
import { Kysely } from "kysely";
import {
  deleteSessionsByUserIdSchema,
  deleteSessionSchema,
  getSessionSchema,
  loginSchema,
  refreshSessionSchema,
  registerSchema,
  setSessionSchema,
  validateSessionSchema,
} from "./schemas";
import { SessionDTO } from "./types";
import z from "zod";
import { ulid } from "ulid";
import { useAppSession } from "@/lib/auth";

const SESSION_EXPIRES = 60 * 60 * 24 * 30; // 30 days

// ## Auth ##
export async function login(
  params: z.infer<ReturnType<typeof loginSchema>>,
  db: Kysely<DB>
): Promise<string> {
  const user = await db
    .selectFrom("user")
    .where("nickname", "=", params.nickname)
    .selectAll()
    .executeTakeFirst();

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const { token } = await setSession({ userId: user.id }, db);

  const { update } = await useAppSession();
  await update({ token });

  return token;
}

export async function register(
  params: z.infer<ReturnType<typeof registerSchema>>,
  db: Kysely<DB>
) {
  const existingUser = await db
    .selectFrom("user")
    .where("nickname", "=", params.nickname)
    .selectAll()
    .executeTakeFirst();

  if (existingUser) {
    throw new Error("User already exists.");
  }

  const user = await db
    .insertInto("user")
    .values({
      id: ulid(),
      password: "",
      nickname: params.nickname,
      createdAt: new Date(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  const { token } = await setSession({ userId: user.id }, db);

  const { update } = await useAppSession();
  await update({ token });

  return user;
}

export async function logout(db: Kysely<DB>): Promise<void> {
  const appSession = await useAppSession();
  const sessionId = appSession.data.token.split(".")[0];
  const session = await getSession({ id: sessionId }, db);

  if (!session) {
    throw new Error("Invalid session");
  }

  await deleteSessionsByUserId({ userId: session.userId }, db);

  const { clear } = await useAppSession();
  await clear();
}

// ## User ##
export async function getUserBySession(db: Kysely<DB>) {
  const appSession = await useAppSession();

  if (!appSession.data.token) {
    return null;
  }

  const sessionId = appSession.data.token.split(".")[0];
  const session = await getSession({ id: sessionId }, db);

  if (!session) {
    return null;
  }

  return await db
    .selectFrom("user")
    .where("id", "=", session.userId)
    .selectAll()
    .executeTakeFirstOrThrow();
}

// ## Session ##
export async function getSession(
  params: z.infer<ReturnType<typeof getSessionSchema>>,
  db: Kysely<DB>
): Promise<SessionDTO | null> {
  const now = new Date();

  const session = await db
    .selectFrom("session")
    .where("id", "=", params.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  if (now.getTime() - session.createdAt.getTime() >= SESSION_EXPIRES * 1000) {
    await deleteSession({ id: session.id }, db);
    return null;
  }

  return session;
}

export async function setSession(
  params: z.infer<ReturnType<typeof setSessionSchema>>,
  db: Kysely<DB>
): Promise<{
  session: SessionDTO;
  token: string;
}> {
  const user = await db
    .selectFrom("user")
    .where("id", "=", params.userId)
    .selectAll()
    .executeTakeFirstOrThrow();

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  const id = generateSecureRandomString();
  const secret = generateSecureRandomString();
  const secretHash = await hashSecret(secret);

  const token = id + "." + secret;

  const session = await db
    .insertInto("session")
    .values({
      id,
      userId: params.userId,
      secretHash: Buffer.from(secretHash),
      createdAt: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    session,
    token,
  };
}

export async function refreshSession(
  params: z.infer<ReturnType<typeof refreshSessionSchema>>,
  db: Kysely<DB>
): Promise<SessionDTO | null> {
  const session = await getSession({ id: params.id }, db);

  if (!session) {
    return null;
  }

  return await db
    .updateTable("session")
    .set({ createdAt: new Date() })
    .where("id", "=", session.id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function deleteSession(
  params: z.infer<ReturnType<typeof deleteSessionSchema>>,
  db: Kysely<DB>
): Promise<void> {
  await db.deleteFrom("session").where("id", "=", params.id).execute();
}

export async function deleteSessionsByUserId(
  params: z.infer<ReturnType<typeof deleteSessionsByUserIdSchema>>,
  db: Kysely<DB>
): Promise<void> {
  await db.deleteFrom("session").where("userId", "=", params.userId).execute();
}

export async function validateSession(
  params: z.infer<ReturnType<typeof validateSessionSchema>>,
  db: Kysely<DB>
): Promise<string | null> {
  const tokenParts = params.token.split(".");

  if (tokenParts.length !== 2) return null;

  const sessionId = tokenParts[0];
  const sessionSecret = tokenParts[1];

  const session = await getSession({ id: sessionId }, db);

  if (!session) return null;

  const tokenSecretHash = await hashSecret(sessionSecret);
  const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);

  if (!validSecret) return null;

  await refreshSession({ id: session.id }, db);

  return params.token;
}

// ## Utils ##
function generateSecureRandomString(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";

  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  let id = "";
  for (let i = 0; i < bytes.length; i++) {
    id += alphabet[bytes[i] >> 3];
  }
  return id;
}

async function hashSecret(secret: string): Promise<Uint8Array> {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
  return new Uint8Array(secretHashBuffer);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < a.byteLength; i++) {
    c |= a[i] ^ b[i];
  }
  return c === 0;
}
