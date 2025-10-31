import { createFileRoute, Link } from "@tanstack/react-router";
import { RequestResearchLayout } from "@/components/layouts/request-research-layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, Building2, Edit, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchProjectOptions,
  fetchResearchOptions,
  fetchResearchsOptions,
} from "@/lib/api";
import { SurveyFillable } from "@/components/survey-fillable";
import { SurveyFillableResult } from "@/components/survery-fillable-result";

export const Route = createFileRoute("/project/$id/survey")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id: projectId } = Route.useParams();

  const { data: project } = useQuery(fetchProjectOptions(projectId));
  const { data: researchs } = useQuery(fetchResearchsOptions());

  const [view, setView] = useState("list");
  const [researchId, setResearchId] = useState("");

  return (
    <RequestResearchLayout>
      <div className={cn("space-y-6 mb-4", view !== "list" && "hidden")}>
        <div className="flex gap-5 justify-start items-start p-6 bg-background rounded-lg">
          <div className="size-10 shrink-0 rounded-md bg-muted flex items-center justify-center">
            <Building2 className="size-6" />
          </div>
          <div className="space-y-0.5 flex-1">
            <div className="text-xs font-medium text-muted-foreground">
              Projeto
            </div>
            <div className="font-medium">{project?.name}</div>
          </div>
          <Link to="/project/$id" params={{ id: projectId }}>
            <Button variant="outline" size="icon">
              <ArrowRight />
            </Button>
          </Link>
        </div>
        <h3 className="text-sm font-medium text-center p-3 border rounded-lg">
          Pesquisas do Projeto
        </h3>
      </div>

      <div className="space-y-4">
        {researchs
          ?.filter(
            (research) => research.municipalityId === project?.municipalityId
          )
          .map((research) => (
            <ResearchItem
              key={research.id}
              view={view}
              viewResearchId={researchId}
              researchId={research.id}
              projectId={projectId}
              surveyId={research.surveyId}
              onView={() => {
                setView("view");
                setResearchId(research.id);
              }}
              onEdit={() => {
                setView("edit");
                setResearchId(research.id);
              }}
              onBack={() => {
                setView("list");
                setResearchId("");
              }}
            />
          ))}
      </div>
    </RequestResearchLayout>
  );
}

function ResearchItem({
  view,
  viewResearchId,
  researchId,
  projectId,
  surveyId,
  onView,
  onEdit,
  onBack,
}: {
  view: string;
  viewResearchId: string;
  researchId: string;
  projectId: string;
  surveyId: string;
  onView: () => void;
  onEdit: () => void;
  onBack: () => void;
}) {
  const { data } = useQuery(fetchResearchOptions(researchId));

  if (!data) {
    return <Skeleton className="w-full h-16" />;
  }

  const isView = view === "view" && viewResearchId === researchId;
  const isEdit = view === "edit" && viewResearchId === researchId;

  const isCompleted = data?.results[projectId];

  return (
    <div className={cn(view !== "list" && !isView && !isEdit && "hidden")}>
      <div
        className={cn(
          "w-full bg-background space-y-4 p-6 rounded-lg border border-dashed",
          (isView || isEdit) && "hidden"
        )}
      >
        <div className="flex justify-between gap-2">
          <div className="space-y-0.5">
            <div className="text-xs font-medium text-muted-foreground">
              Nome
            </div>
            <div className="text-lg font-medium">{data.research.name}</div>
          </div>

          <div className="space-y-1 flex flex-col items-end">
            <div className="text-xs font-medium text-muted-foreground">
              Perguntado em
            </div>
            <div className="text-sm font-medium">
              {format(data.research.createdAt, "dd-MM-yyyy")}
            </div>
          </div>
        </div>
        <div className="grid  gap-2">
          {isCompleted ? (
            <div className="flex gap-2 items-start justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={onEdit}>
                  <Edit />
                </Button>
                <Button variant="outline" size="icon" onClick={onView}>
                  <Eye />
                </Button>
              </div>

              <Badge variant="secondary">Completo</Badge>
            </div>
          ) : (
            <Button onClick={onEdit}>Iniciar Pesquisa</Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "space-y-4 flex flex-col items-center",
          !isEdit && "hidden"
        )}
      >
        <SurveyFillable
          id={surveyId}
          projectId={projectId}
          researchId={researchId}
          onSuccess={onBack}
        />
        <Button variant="underline" size="sm" onClick={onBack}>
          <ArrowLeft /> Voltar
        </Button>
      </div>

      <div className={cn(!isView && "hidden")}>
        <SurveyFillableResult
          projectId={projectId}
          researchId={researchId}
          onBack={onBack}
        />
      </div>
    </div>
  );
}
