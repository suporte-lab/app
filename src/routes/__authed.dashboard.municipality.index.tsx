import { createFileRoute } from "@tanstack/react-router";
import { MunicipalitySetForm } from "@/components/municipality/set-form";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/header";
import { MunicipalityDataTable } from "@/components/municipality/data-table";

export const Route = createFileRoute("/__authed/dashboard/municipality/")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout title="Municípios">
      <DashboardHeader title="Municípios" right={<MunicipalitySetForm />} />
      <MunicipalityDataTable />
    </DashboardLayout>
  );
}
