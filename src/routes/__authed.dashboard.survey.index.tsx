import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/header";
import { SurveySetForm } from "@/components/research/survey-set-form";
import { SurveyDataTable } from "@/components/research/survey-data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/__authed/dashboard/survey/")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  return (
    <DashboardLayout title="Formulários de pesquisa">
      <DashboardHeader
        title="Formulários de pesquisa"
        right={
          <SurveySetForm
            trigger={
              <Button>
                <Plus />
                Adicionar formulário
              </Button>
            }
            onSuccess={(id) => {
              console.log("id", id);
              router.navigate({
                to: "/dashboard/survey/$id",
                params: { id },
              });
            }}
          />
        }
      />
      <SurveyDataTable />
    </DashboardLayout>
  );
}
