import { ulid } from "ulid";
import { db } from "../db";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { AppEnv } from "../app";
import { loginSchema } from "../schemas";

// Middleware
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const cookie = getCookie(c, "auth_session");
  if (!cookie) return c.json({ message: "Não autorizado" }, 401);

  const [sessionId, secret] = cookie.split(".");
  if (!sessionId || !secret) return c.json({ message: "Pedido inválido" }, 401);

  const session = await db
    .selectFrom("session")
    .select(["userId", "secretHash"])
    .where("id", "=", sessionId)
    .executeTakeFirst();

  if (!session) return c.json({ message: "Sessão inválida" }, 401);

  const providedHash = await hashSecret(secret);
  const storedHash = new Uint8Array(session.secretHash);

  if (!crypto.timingSafeEqual(providedHash, storedHash)) {
    return c.json({ message: "Sessão inválida" }, 401);
  }

  setCookie(c, "auth_session", cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  const user = await db
    .selectFrom("user")
    .select(["id", "nickname"])
    .where("id", "=", session.userId)
    .executeTakeFirstOrThrow();

  c.set("user", user);
  await next();
});

// Routes
export const authRoute = new Hono<AppEnv>()
  .get("/verify", async (c) => {
    const cookie = getCookie(c, "auth_session");

    if (!cookie) {
      return c.json({ isAuthenticated: false, user: null });
    }

    const [sessionId, secret] = cookie.split(".");

    if (!sessionId || !secret) {
      return c.json({ isAuthenticated: false, user: null });
    }

    const session = await db
      .selectFrom("session")
      .select(["userId", "secretHash"])
      .where("id", "=", sessionId)
      .executeTakeFirst();

    if (!session) {
      return c.json({ isAuthenticated: false, user: null });
    }

    const providedHash = await hashSecret(secret);
    const storedHash = new Uint8Array(session.secretHash);

    if (!crypto.timingSafeEqual(providedHash, storedHash)) {
      return c.json({ isAuthenticated: false, user: null });
    }

    const user = await db
      .selectFrom("user")
      .select(["id", "nickname"])
      .where("id", "=", session.userId)
      .executeTakeFirstOrThrow();

    return c.json({ isAuthenticated: true, user });
  })
  .get("/me", authMiddleware, (c) => {
    return c.json({ user: c.var.user });
  })
  .post("logout", authMiddleware, async (c) => {
    deleteCookie(c, "auth_session", { path: "/" });

    await db
      .deleteFrom("session")
      .where("userId", "=", c.var.user.id)
      .execute();

    return c.json({ message: "Sessão terminada" });
  })
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const payload = c.req.valid("json");
    const secret = generateSecureRandomString();
    const secretHash = await hashSecret(secret);

    let token = "";

    const user = await db
      .selectFrom("user")
      .select(["id"])
      .where("nickname", "=", payload.nickname)
      .executeTakeFirst();

    if (!user) {
      return c.json({ message: "Credenciais inválidas", token: null }, 401);
    }

    let existingSession = await db
      .selectFrom("session")
      .select(["id", "secretHash"])
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (existingSession) {
      await db
        .updateTable("session")
        .set({ secretHash: Buffer.from(secretHash) })
        .where("userId", "=", user.id)
        .execute();

      token = existingSession.id + "." + secret;
    } else {
      const session = await db
        .insertInto("session")
        .values({
          id: ulid(),
          userId: user.id,
          secretHash: Buffer.from(secretHash),
        })
        .returning(["id"])
        .executeTakeFirstOrThrow();

      token = session.id + "." + secret;
    }

    if (!token) {
      return c.json({ message: "Erro no servidor", token: null }, 500);
    }

    setCookie(c, "auth_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return c.json({ message: "Sessāo iniciada", token });
  });

// Helpers
async function hashSecret(secret: string): Promise<Uint8Array> {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
  return new Uint8Array(secretHashBuffer);
}

function generateSecureRandomString(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  let id = "";
  for (const byte of bytes) {
    id += alphabet[byte >> 3];
  }

  return id;
}
