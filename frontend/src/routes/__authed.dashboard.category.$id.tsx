import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { Building2, MapPin, Trash2Icon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import {
  api,
  fetchCategoryOptions,
  fetchMunicipalitiesOptions,
  fetchProjectsOptions,
} from "@/lib/api";
import { CategoryForm } from "@/components/category-form";
import { MunicipalityMapBanner } from "@/components/municipality-map-banner";
import { ProjectTable } from "@/components/project-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/__authed/dashboard/category/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const ctx = Route.useRouteContext();
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: category } = useQuery(fetchCategoryOptions(id));
  const { data: municipalities } = useQuery(fetchMunicipalitiesOptions());
  const { data: projects } = useQuery(fetchProjectsOptions());

  const categoryMunicipalities = useMemo(() => {
    return [
      ...new Set(
        projects?.map((p) =>
          municipalities?.find((m) => m.id === p.municipalityId)
        )
      ),
    ].filter((m) => m !== undefined);
  }, [projects, municipalities]);

  if (!category) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <DashboardLayout auth={ctx.auth} title="Categoria de projeto">
      <DashboardHeader
        title={category.name}
        right={
          <>
            <CategoryForm id={category.id} />
            <ConfirmDialog
              title="Deletar categoria"
              onConfirm={async () => {
                const res = await api.categories[":id"].$delete({
                  param: { id },
                });

                if (!res.ok) {
                  return toast.error("Error servidor");
                }

                toast.success("Apagado com sucesso.");
                queryClient.invalidateQueries({ queryKey: ["categories"] });
                navigate({ to: "/dashboard/project" });
              }}
            >
              <Button variant="outline">
                <Trash2Icon />
                Apagar
              </Button>
            </ConfirmDialog>
          </>
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
              <h2 className="text-sm">Municípios</h2>
              <p className="text-2xl font-bold">
                {categoryMunicipalities.length ?? 0}
              </p>
            </div>

            <div className="flex gap-1">
              {categoryMunicipalities.map((m) => (
                <Badge variant="outline" size="lg" key={m.id}>
                  {m.name}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {categoryMunicipalities.map((m) => (
        <div key={m.id} className="flex flex-col gap-4">
          <DashboardHeader title={m.name} />
          <MunicipalityMapBanner id={m.id} categoryId={id} />
          <ProjectTable municipalityId={m.id} categoryId={id} />
        </div>
      ))}
    </DashboardLayout>
  );
}
