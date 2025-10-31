import { DashboardCountCard } from "@/components/dashboard-count-card";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { MapSearch } from "@/components/map-search";
import { MonitorSearch } from "@/components/monitor-search";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchCategoriesOptions,
  fetchMunicipalitiesOptions,
  fetchProjectsOptions,
} from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/__authed/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const ctx = Route.useRouteContext();

  const { data: municipalities } = useQuery(fetchMunicipalitiesOptions());
  const { data: projects } = useQuery(fetchProjectsOptions());
  const { data: categories } = useQuery(fetchCategoriesOptions());

  return (
    <DashboardLayout auth={ctx.auth} title="Dashboard">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {municipalities ? (
          <Link to="/dashboard/municipality">
            <DashboardCountCard
              count={municipalities?.length ?? 0}
              title="Municípios"
            />
          </Link>
        ) : (
          <Skeleton className="w-full aspect-16/6" />
        )}

        {projects ? (
          <Link to="/dashboard/project">
            <DashboardCountCard
              count={projects?.length ?? 0}
              title="Projetos"
            />
          </Link>
        ) : (
          <Skeleton className="w-full aspect-16/6" />
        )}

        {categories ? (
          <Link to="/dashboard/project">
            <DashboardCountCard
              count={categories?.length ?? 0}
              title="Categorias"
            />
          </Link>
        ) : (
          <Skeleton className="w-full aspect-16/6" />
        )}
      </div>

      <DashboardHeader title="Projetos" />
      <MapSearch />
      <DashboardHeader title="Análise de dados" />
      <MonitorSearch />
    </DashboardLayout>
  );
}
