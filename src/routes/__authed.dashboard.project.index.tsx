import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProjectCategorySetForm } from "@/components/project/category-set-form";
import { ProjectSetForm } from "@/components/project/project-set-form";
import { ProjectDataTable } from "@/components/project/project-data-table";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProjectCategoriesOptions } from "@/server/services/project/options";
import { getMunicipalitiesOptions } from "@/server/services/municipality/options";
import { ProjectsImportDialog } from "@/components/project/projects-import-dialog";
import { DownloadIcon } from "lucide-react";

export const Route = createFileRoute("/__authed/dashboard/project/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: categories } = useQuery(getProjectCategoriesOptions());
  const { data: municipalities } = useQuery(getMunicipalitiesOptions());

  return (
    <DashboardLayout title="Unidades">
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
            <ProjectCategorySetForm />
            {!!categories?.length && <ProjectSetForm />}
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
      <ProjectDataTable />
    </DashboardLayout>
  );
}
