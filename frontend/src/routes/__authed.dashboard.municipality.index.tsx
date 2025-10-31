import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { MunicipalityTable } from "@/components/municipality-table";
import { MunicipalityForm } from "@/components/municipality-form";

export const Route = createFileRoute("/__authed/dashboard/municipality/")({
  component: RouteComponent,
});

function RouteComponent() {
  const ctx = Route.useRouteContext();

  return (
    <DashboardLayout auth={ctx.auth} title="Municípios">
      <DashboardHeader title="Municípios" right={<MunicipalityForm />} />
      <MunicipalityTable />
    </DashboardLayout>
  );
}
