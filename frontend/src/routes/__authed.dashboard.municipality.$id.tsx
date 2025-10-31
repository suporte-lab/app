import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { Building2, MapPin, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// import { ResearchCategoryCharts } from "@/components/research/research-category-charts";
import { api, fetchMunicipalityOptions, fetchProjectsOptions } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ProjectTable } from "@/components/project-table";
import { MunicipalityMapBanner } from "@/components/municipality-map-banner";

export const Route = createFileRoute("/__authed/dashboard/municipality/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const ctx = Route.useRouteContext();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: municipality } = useQuery(fetchMunicipalityOptions(id));
  const { data: projects } = useQuery(fetchProjectsOptions());

  const list = projects?.filter((p) => p.municipalityId === id);

  if (!municipality) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <DashboardLayout auth={ctx.auth} title="Município">
      <DashboardHeader
        title={municipality.name}
        right={
          <ConfirmDialog
            title="Deletar município"
            onConfirm={async () => {
              const res = await api.municipalities[":id"].$delete({
                param: { id },
              });

              if (!res.ok) {
                return toast.error("Error servidor");
              }

              toast.success("Apagado com sucesso.");
              queryClient.invalidateQueries({ queryKey: ["municipalities"] });
              navigate({ to: "/dashboard/municipality" });
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
                <p className="text-2xl font-bold">{list?.length ?? 0}</p>
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
      <ProjectTable municipalityId={id} />
      <DashboardHeader title="Pesquisas" />
      CHART TO DO
      {/* <ResearchCategoryCharts municipalityId={id} /> */}
    </DashboardLayout>
  );
}
