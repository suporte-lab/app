import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ResearchTable } from "@/components/research-table";
import { ResearchForm } from "@/components/research-form";

export const Route = createFileRoute("/__authed/dashboard/research/")({
  component: RouteComponent,
});

function RouteComponent() {
  const ctx = Route.useRouteContext();

  return (
    <DashboardLayout auth={ctx.auth} title="Pesquisas">
      <DashboardHeader
        title="Pesquisas"
        right={
          <ResearchForm
            trigger={
              <Button>
                <Plus />
                Adicionar pesquisa
              </Button>
            }
          />
        }
      />

      <ResearchTable />
    </DashboardLayout>
  );
}
