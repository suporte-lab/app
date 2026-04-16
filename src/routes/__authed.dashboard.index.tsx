import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { DashboardCountCard } from "@/components/dashboard/count-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProjectCategoriesOptions,
  getProjectsListOptions,
} from "@/server/services/project/options";
import { getMunicipalitiesOptions } from "@/server/services/municipality/options";
import { DashboardHeader } from "@/components/dashboard/header";
import { MapSearch } from "@/components/map-search";
import { MonitorSearch } from "@/components/monitor-search";

export const Route = createFileRoute("/__authed/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery(getMunicipalitiesOptions());
  const { data: projects } = useQuery(getProjectsListOptions({}));
  const { data: categories } = useQuery(getProjectCategoriesOptions());

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data ? (
          <Link to="/dashboard/municipality">
            <DashboardCountCard count={data?.length ?? 0} title="Municípios" />
          </Link>
        ) : (
          <Skeleton className="w-full aspect-[16/6]" />
        )}

        {projects ? (
          <Link to="/dashboard/project">
            <DashboardCountCard
              count={projects?.length ?? 0}
              title="Projetos"
            />
          </Link>
        ) : (
          <Skeleton className="w-full aspect-[16/6]" />
        )}

        {categories ? (
          <Link to="/dashboard/project">
            <DashboardCountCard
              count={categories?.length ?? 0}
              title="Categorias"
            />
          </Link>
        ) : (
          <Skeleton className="w-full aspect-[16/6]" />
        )}
      </div>

      <DashboardHeader title="Projetos" />
      <MapSearch />
      <DashboardHeader title="Análise de dados" />
      <MonitorSearch />
    </DashboardLayout>
  );
}
