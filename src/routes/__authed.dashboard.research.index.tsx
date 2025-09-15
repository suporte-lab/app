import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ResearchSetForm } from "@/components/research/research-set-form";
import { ResearchCard } from "@/components/research/research-card";
import { useQuery } from "@tanstack/react-query";
import { getResearchsListOptions } from "@/server/services/research/options";
import { ResearchDataTable } from "@/components/research/research-data-table";

export const Route = createFileRoute("/__authed/dashboard/research/")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const { data: researchs } = useQuery(getResearchsListOptions());

  return (
    <DashboardLayout title="Pesquisas">
      <DashboardHeader
        title="Pesquisas"
        right={
          <ResearchSetForm
            trigger={
              <Button>
                <Plus />
                Adicionar pesquisa
              </Button>
            }
          />
        }
      />

      <ResearchDataTable />
    </DashboardLayout>
  );
}
