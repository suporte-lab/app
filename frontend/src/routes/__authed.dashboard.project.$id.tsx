import { ConfirmDialog } from "@/components/confirm-dialog";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ProjectForm } from "@/components/project-form";
import { ProjectMapBanner } from "@/components/project-map-banner";
import { ResearchProjectCharts } from "@/components/research-project-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  api,
  fetchCategoriesOptions,
  fetchMunicipalitiesOptions,
  fetchProjectOptions,
} from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EditIcon, MapPin, Phone, Trash2Icon, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/__authed/dashboard/project/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const ctx = Route.useRouteContext();
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: project } = useQuery(fetchProjectOptions(id));
  const { data: municipalities } = useQuery(fetchMunicipalitiesOptions());
  const { data: categories } = useQuery(fetchCategoriesOptions());

  if (!project) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  const { addressStreet, addressNumber, addressZipCode } = project;
  const municipality = municipalities?.find(
    (m) => m.id === project?.municipalityId
  );
  const category = categories?.find((c) => c.id === project?.categoryId);

  if (!municipality) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <DashboardLayout auth={ctx.auth} title="Unidade">
      <DashboardHeader
        title={project.name}
        right={
          <>
            <ConfirmDialog
              title="Deletar município"
              onConfirm={async () => {
                const res = await api.projects[":id"].$delete({
                  param: { id },
                });

                if (!res.ok) {
                  return toast.error("Error servidor");
                }

                toast.success("Apagado com sucesso.");
                queryClient.invalidateQueries({ queryKey: ["projects"] });
                navigate({ to: "/dashboard/project" });
              }}
            >
              <Button variant="outline">
                <Trash2Icon />
                Apagar
              </Button>
            </ConfirmDialog>
            <ProjectForm
              id={project.id}
              trigger={
                <Button>
                  <EditIcon />
                  Editar
                </Button>
              }
            />
          </>
        }
      />
      <div className="flex flex-col xl:flex-row gap-2 ">
        <Card className="p-6 bg">
          <div className="space-y-2 flex gap-16 justify-between items-start">
            <div className="flex gap-5 items-start">
              <div className="p-2 bg-muted size-10 rounded-md mb-4">
                <User className="size-full" />
              </div>
              <div>
                <h2 className="text-sm">{project.responsibleRole}</h2>
                <p className="text-2xl font-medium">
                  {project.responsibleName}
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <Badge variant="outline" size="lg">
                <Phone />
                {project.responsiblePhone}
              </Badge>
            </div>
          </div>
        </Card>
        <Card className="p-6 flex-1">
          <div className="flex gap-5 items-start">
            <div className="p-2 bg-muted size-10 rounded-md mb-4">
              <MapPin className="size-full" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm">Location</h2>
              <p className="font-medium">
                {`${addressStreet} ${addressNumber}, ${addressZipCode} ${municipality?.name}`}
              </p>
              <div className="flex gap-1 mt-2">
                <Badge variant="outline">{project.latitude}</Badge>
                <Badge variant="outline">{project.longitude}</Badge>
              </div>
            </div>

            <div className="flex gap-1">
              <Badge variant="outline" size="lg" asChild>
                <Link
                  to="/dashboard/municipality/$id"
                  params={{ id: municipality.id }}
                >
                  {municipality.name}
                </Link>
              </Badge>
              {category && (
                <Badge variant="outline" size="lg">
                  <Link
                    to="/dashboard/category/$id"
                    params={{ id: category.id }}
                  >
                    {category?.name}
                  </Link>
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
      <ProjectMapBanner id={project.id} />
      <DashboardHeader title="Pesquisas" />
      <ResearchProjectCharts projectId={project.id} />
    </DashboardLayout>
  );
}
