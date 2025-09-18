import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMunicipalitiesOptions } from "@/server/services/municipality/options";
import {
  getProjectCategoriesOptions,
  getProjectOptions,
} from "@/server/services/project/options";
import { ProjectMapBanner } from "@/components/project/project-map-banner";
import { ResearchProjectCharts } from "@/components/research/research-project-charts";
import { PublicLayout } from "@/components/layouts/public-layout";

export const Route = createFileRoute("/project/$id/")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const { data: project } = useQuery(getProjectOptions({ id }));
  const { data: municipalities } = useQuery(getMunicipalitiesOptions());
  const { data: categories } = useQuery(getProjectCategoriesOptions());

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

  if (!municipality || !category) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <PublicLayout>
      <div className="space-y-5 p-10 max-w-screen-xl w-full mx-auto">
        <div>
          <Button variant="outline" asChild>
            <Link to="/map">
              <ArrowLeft />
              Voltar ao mapa
            </Link>
          </Button>
        </div>
        <div className="flex gap-2 ">
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
                <Badge variant="outline" size="lg">
                  {municipality.name}
                </Badge>
                <Badge variant="outline" size="lg">
                  {category?.name}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        <ProjectMapBanner id={project.id} />
        <DashboardHeader title="Pesquisas" />
        <ResearchProjectCharts projectId={project.id} />
      </div>
    </PublicLayout>
  );
}
