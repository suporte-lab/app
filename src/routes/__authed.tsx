import { validateSessionFn } from "@/server/services/auth/functions";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/__authed")({
  beforeLoad: async ({ context }) => {
    try {
      if (!context.session) {
        throw new Error("Unauthorized");
      }

      await validateSessionFn({
        data: { token: context.session.token },
      });

      return context;
    } catch (error) {
      throw redirect({ to: "/" });
    }
  },
});
