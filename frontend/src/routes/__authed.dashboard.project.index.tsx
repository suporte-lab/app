import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchCategoriesOptions, fetchMunicipalitiesOptions } from "@/lib/api";
import { ProjectForm } from "@/components/project-form";
import { ProjectTable } from "@/components/project-table";
import { CategoryForm } from "@/components/category-form";
import { ProjectsImportDialog } from "@/components/projects-import-dialog";
import { DownloadIcon } from "lucide-react";

export const Route = createFileRoute("/__authed/dashboard/project/")({
  component: RouteComponent,
});

function RouteComponent() {
  const ctx = Route.useRouteContext();
  const { data: categories } = useQuery(fetchCategoriesOptions());
  const { data: municipalities } = useQuery(fetchMunicipalitiesOptions());

  return (
    <DashboardLayout auth={ctx.auth} title="Unidades">
      <DashboardHeader
        title="Unidades"
        right={
          <div className="flex gap-2">
            <ProjectsImportDialog>
              <Button variant="secondary">
                <DownloadIcon />
                Importar
              </Button>
            </ProjectsImportDialog>
            <CategoryForm />
            {!!categories?.length && <ProjectForm />}
          </div>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {!!municipalities?.length ? (
            <>
              {municipalities?.map((m) => (
                <Button key={m.id} variant="outline" asChild>
                  <Link to="/dashboard/municipality/$id" params={{ id: m.id }}>
                    {m.name}
                  </Link>
                </Button>
              ))}
            </>
          ) : (
            <div className="text-xs text-center flex-1">Sem resultados</div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {!!categories?.length ? (
            <>
              {categories?.map((category) => (
                <Button key={category.id} variant="outline" asChild>
                  <Link
                    to="/dashboard/category/$id"
                    params={{ id: category.id }}
                  >
                    {category.name}
                  </Link>
                </Button>
              ))}
            </>
          ) : (
            <div className="text-xs text-center flex-1">
              Nenhuma categoria encontrada
            </div>
          )}
        </div>
      </Card>
      <ProjectTable />
    </DashboardLayout>
  );
}
