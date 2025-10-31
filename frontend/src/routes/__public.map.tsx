import { MapSearch } from "@/components/map-search";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__public/map")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MapSearch isPublic />;
}
