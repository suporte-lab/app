// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/public-layout";
import { MonitorPublicView } from "@/components/monitor-public-view";

export const Route = createFileRoute("/monitoring")({
  component: Home,
  ssr: false,
});

function Home() {
  return (
    <PublicLayout>
      <MonitorPublicView />
    </PublicLayout>
  );
}
