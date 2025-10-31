import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SurveyForm } from "@/components/survey-form";
import { SurveyTable } from "@/components/survey-table";

export const Route = createFileRoute("/__authed/dashboard/survey/")({
  component: RouteComponent,
});

function RouteComponent() {
  const ctx = Route.useRouteContext();

  return (
    <DashboardLayout auth={ctx.auth} title="Formulários de pesquisa">
      <DashboardHeader
        title="Formulários de pesquisa"
        right={
          <SurveyForm
            trigger={
              <Button>
                <Plus />
                Adicionar formulário
              </Button>
            }
          />
        }
      />
      <SurveyTable />
    </DashboardLayout>
  );
}
