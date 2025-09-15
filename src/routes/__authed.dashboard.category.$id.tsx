import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/header";
import { Building2, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMunicipalitiesOptions } from "@/server/services/municipality/options";
import { ProjectDataTable } from "@/components/project/project-data-table";
import {
  getProjectCategoryOptions,
  getProjectsListOptions,
} from "@/server/services/project/options";
import { useMemo } from "react";
import { MunicipalityMapBanner } from "@/components/municipality/municipality-map-banner";
import { ProjectCategorySetForm } from "@/components/project/category-set-form";

export const Route = createFileRoute("/__authed/dashboard/category/$id")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const { data: category } = useQuery(getProjectCategoryOptions({ id }));
  const { data: municipalities } = useQuery(getMunicipalitiesOptions());

  const { data: projects } = useQuery(
    getProjectsListOptions({ categoryId: id })
  );

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
    <DashboardLayout title="Categoria de projeto">
      <DashboardHeader
        title={category.name}
        right={<ProjectCategorySetForm category={category} />}
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
          <ProjectDataTable municipalityId={m.id} categoryId={id} />
        </div>
      ))}
    </DashboardLayout>
  );
}
