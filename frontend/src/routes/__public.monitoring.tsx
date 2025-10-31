import { MonitorPublicView } from "@/components/monitor-public-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__public/monitoring")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MonitorPublicView />;
}
