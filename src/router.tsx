// src/router.tsx
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { routeTree } from "./routeTree.gen";
import { QueryClient } from "@tanstack/react-query";
import { SessionDTO } from "@/server/services/auth/types";
import { DefaultCatchBoundary } from "./components/default-catch-boundary";
import { NotFound } from "./components/not-found";

export interface RouterContext {
  queryClient: QueryClient;
  session?: SessionDTO | null;
}

export function createRouter() {
  const queryClient = new QueryClient();

  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { queryClient },
      defaultPreload: "intent",
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,
    }),
    queryClient
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    routerContext: RouterContext;
    router: ReturnType<typeof createRouter>;
  }
}
