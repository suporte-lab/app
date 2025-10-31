import { Toaster } from "@/components/ui/sonner";
import { api } from "@/lib/api";
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { type AuthSession } from "@server/types";

interface MyRouterContext {
  auth: AuthSession;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context }) => {
    const ctx = { ...context };

    const res = await api.auth.verify.$get();
    if (!res.ok) throw redirect({ to: "/" });
    const { isAuthenticated, user } = await res.json();

    ctx.auth = { isAuthenticated, user };

    return ctx;
  },
  component: () => (
    <div>
      <Outlet />
      <Toaster />
    </div>
  ),
});
