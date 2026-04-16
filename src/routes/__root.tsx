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

export const Route = createRootRoute({
  shellComponent: RootShell,
  component: RootComponent,
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
  errorComponent: () => <div>Error</div>,
  notFoundComponent: () => <div>Not found</div>,
  ssr: false,
});

function RootShell({ children }: { children: React.ReactNode }) {
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

function RootComponent() {
  return <Outlet />;
}

// function RootComponent() {
//   return (
//     <RootDocument>
//       <Outlet />
//     </RootDocument>
//   );
// }

// function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
//   return (
//     <html>
//       <head>
//         <HeadContent />
//       </head>
//       <body>
//         {children}
//         <Toaster />
//         <Scripts />
//       </body>
//     </html>
//   );
// }
