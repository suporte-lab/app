import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/__authed")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
});
