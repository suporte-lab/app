import { z } from "zod";

// ## Auth ##
export const loginSchema = () =>
  z.object({
    nickname: z.string().min(1, "Missing nickname"),
  });

export const registerSchema = () =>
  z.object({
    nickname: z.string().min(1, "Missing nickname"),
  });

// ## User ##
export const getUserSchema = () =>
  z.object({
    id: z.string(),
  });

export const getUserByEmailSchema = () =>
  z.object({
    email: z.email(),
  });

export const setUserSchema = () =>
  z.object({
    email: z.email(),
    nickname: z.string(),
    password: z.string(),
  });

export const updateUserSchema = () =>
  z.object({
    id: z.string(),
    email: z.email(),
    nickname: z.string(),
  });

// ## Session ##
export const getSessionSchema = () =>
  z.object({
    id: z.string(),
  });

export const setSessionSchema = () =>
  z.object({
    userId: z.string(),
  });

export const refreshSessionSchema = () =>
  z.object({
    id: z.string(),
  });

export const validateSessionSchema = () =>
  z.object({
    token: z.string(),
  });

export const deleteSessionSchema = () =>
  z.object({
    id: z.string(),
  });

export const deleteSessionsByUserIdSchema = () =>
  z.object({
    userId: z.string(),
  });
