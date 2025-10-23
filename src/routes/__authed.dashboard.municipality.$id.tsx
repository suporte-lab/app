import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/header";
import { Building2, MapPin, Trash2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMunicipalityOptions } from "@/server/services/municipality/options";
import { ProjectDataTable } from "@/components/project/project-data-table";
import { getProjectsListOptions } from "@/server/services/project/options";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteMunicipalityFn } from "@/server/services/municipality/functions";
import { toast } from "sonner";
import { MunicipalityMapBanner } from "@/components/municipality/municipality-map-banner";
import { ResearchCategoryCharts } from "@/components/research/research-category-charts";

export const Route = createFileRoute("/__authed/dashboard/municipality/$id")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: municipality } = useQuery(getMunicipalityOptions({ id }));

  const { data: projects } = useQuery(
    getProjectsListOptions({ municipalityId: id })
  );

  const { mutate: deleteMunicipality } = useMutation({
    mutationFn: deleteMunicipalityFn,
    onSuccess: () => {
      toast.success("Apagado com sucesso.");
      navigate({ to: "/dashboard/municipality" });
    },
  });

  if (!municipality) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Município">
      <DashboardHeader
        title={municipality.name}
        right={
          <ConfirmDialog
            title="Deletar município"
            onConfirm={() => {
              deleteMunicipality({ data: { id } });
            }}
          >
            <Button variant="outline" size="icon">
              <Trash2 className="size-4" />
            </Button>
          </ConfirmDialog>
        }
      />
      <div className="flex gap-2 ">
        <Card className="p-6 flex-1 max-w-64">
          <div className="space-y-2 flex gap-16 justify-between items-start">
            <div className="flex gap-5 items-start">
              <div className="p-2 bg-muted size-10 rounded-md mb-4">
                <Building2 className="size-full" />
              </div>
              <div>
                <h2 className="text-sm">Projetos</h2>
                <p className="text-2xl font-bold">{projects?.length ?? 0}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-6 flex-1">
          <div className="flex gap-5 items-start">
            <div className="p-2 bg-muted size-10 rounded-md mb-4">
              <MapPin className="size-full" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm">{municipality.state}</h2>
              <p className="font-medium">{municipality.name}</p>
            </div>

            <div className="flex gap-1">
              <Badge variant="outline" size="lg">
                {municipality?.name}
              </Badge>
              <Badge variant="outline" size="lg">
                {municipality.state}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <DashboardHeader title="Projetos" />
      <MunicipalityMapBanner id={id} />
      <ProjectDataTable municipalityId={id} />
      <DashboardHeader title="Pesquisas" />
      <ResearchCategoryCharts municipalityId={id} />
    </DashboardLayout>
  );
}
