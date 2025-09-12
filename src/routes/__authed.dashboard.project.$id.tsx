import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProjectSetForm } from "@/components/project/project-set-form";
import { Button } from "@/components/ui/button";
import { EditIcon, MapPin, Phone, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Map } from "@/components/map";
import { MapMarker } from "@/components/map-marker";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMunicipalitiesOptions } from "@/server/services/municipality/options";
import {
  getProjectCategoriesOptions,
  getProjectOptions,
} from "@/server/services/project/options";
import { ProjectMapBanner } from "@/components/project/project-map-banner";
import { ResearchProjectCharts } from "@/components/research/research-project-charts";

export const Route = createFileRoute("/__authed/dashboard/project/$id")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const { data: project } = useQuery(getProjectOptions({ id }));
  const { data: municipalities } = useQuery(getMunicipalitiesOptions());
  const { data: categories } = useQuery(getProjectCategoriesOptions());

  // const { data: researchs } = useQuery(getProjectResearchsQueryOptions({ id }));

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

  const questions: string[] = [];

  // for (const research of Object.values(researchs ?? {})) {
  //   for (const answer of research.answers) {
  //     if (!["number"].includes(answer.type)) continue;

  //     if (!questions.includes(answer.question)) {
  //       questions.push(answer.question);
  //     }
  //   }
  // }

  if (!municipality || !category) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <DashboardLayout title="Project">
      <DashboardHeader
        title={project.name}
        right={
          <ProjectSetForm
            trigger={
              <Button>
                <EditIcon />
                Edit
              </Button>
            }
            project={project}
          />
        }
      />
      <div className="flex gap-2 ">
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
              <Badge variant="outline" size="lg">
                <Link to="/dashboard/category/$id" params={{ id: category.id }}>
                  {category?.name}
                </Link>
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <ProjectMapBanner id={project.id} />
      <DashboardHeader title="Researchs" />
      <ResearchProjectCharts projectId={project.id} />

      {/* {!researchs || !Object.keys(researchs).length ? (
        <div className="flex flex-col gap-4">Researchs not found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {questions.map((question, i) => {
            const data: { name: string; value: number }[] = [];

            for (const research of Object.values(researchs ?? {})) {
              const answer = research.answers.find(
                (answer) => answer.question === question
              );

              if (!answer) continue;

              data.push({
                name: format(new Date(research.createdAt), "MMMM yyyy"),
                value: parseInt(answer.answer) ?? 0,
              });

              console.log(data);
            }
            return (
              <Card key={i} className="space-y-4 p-6">
                <div className="flex-1">
                  <h2 className="text-lg font-medium px-5 border-l">
                    {question}
                  </h2>
                </div>
                <ChartLine data={data} />
              </Card>
            );
          })}
        </div>
      )} */}
    </DashboardLayout>
  );
}
