// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { MapSearch } from "@/components/map-search";
import { PublicLayout } from "@/components/layouts/public-layout";

export const Route = createFileRoute("/map")({
  component: Home,
});

function Home() {
  return (
    <PublicLayout>
      <MapSearch isPublic />
    </PublicLayout>
  );
}
