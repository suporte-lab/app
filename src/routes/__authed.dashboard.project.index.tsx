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

export const Route = createFileRoute("/__authed/dashboard/project/")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const { data: categories } = useQuery(getProjectCategoriesOptions());
  return (
    <DashboardLayout title="Projetos">
      <DashboardHeader
        title="Projetos"
        right={
          <div className="flex gap-2">
            <ProjectCategorySetForm />
            {!!categories?.length && <ProjectSetForm />}
          </div>
        }
      />
      <Card className="p-4">
        <div className="flex gap-2">
          {!!categories?.length ? (
            categories?.map((category) => (
              <Button key={category.id} variant="outline" asChild>
                <Link to="/dashboard/category/$id" params={{ id: category.id }}>
                  {category.name}
                </Link>
              </Button>
            ))
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
