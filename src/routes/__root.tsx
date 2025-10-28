// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import styles from "../styles/app.css?url";
import { Toaster } from "sonner";
import { getSessionFn } from "../server/services/auth/functions";

export const Route = createRootRoute({
  beforeLoad: async () => {
    try {
      const session = await getSessionFn();
      return { session };
    } catch {
      return { session: null }
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cinco Básicos" },
    ],
    links: [
      { rel: "stylesheet", href: styles },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
