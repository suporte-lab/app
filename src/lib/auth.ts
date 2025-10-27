// src/services/session.server.ts
import { useSession } from "@tanstack/react-start/server";

export function useAppSession() {
  return useSession<{ token: string }>({
    password: process.env.APP_SECRET!,
  });
}
