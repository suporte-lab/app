import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getSurveyOptions,
  getSurveyQuestionsOptions,
} from "@/server/services/research/options";
import { Skeleton } from "@/components/ui/skeleton";
import { SurveyQuestionSetForm } from "@/components/research/survey-question-set-form";
import { SurveyForm } from "@/components/research/survey-form";
import { SurveySetForm } from "@/components/research/survey-set-form";

export const Route = createFileRoute("/__authed/dashboard/survey/$id")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const { data: survey } = useQuery(getSurveyOptions({ id }));
  const { data: questions } = useQuery(getSurveyQuestionsOptions({ id }));

  if (!survey) {
    return (
      <DashboardLayout title="Survey">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  const publicQuestions = questions?.filter((question) => question.isPublic);

  return (
    <DashboardLayout title={survey.name}>
      <DashboardHeader
        title={survey.name}
        right={
          <>
            <SurveySetForm
              survey={survey}
              trigger={
                <Button variant="outline">
                  Editar
                </Button>
              }
              onSuccess={(id) => {
                console.log("id", id);
              }}
            />
            <SurveyQuestionSetForm
              surveyId={id}
              trigger={
                <Button>
                  <Plus />
                  Adicionar pergunta
                </Button>
              }
            />
          </>
        }
      />
      <div className="p-16 pb-24 flex flex-col text-center items-center justify-center border border-dashed rounded-md gap-16">
        <SurveyForm id={id} edit />
      </div>
      {!!publicQuestions?.length && (
        <div className="p-16 pb-24 flex flex-col text-center items-center justify-center border border-dashed rounded-md gap-8">
          <h2 className="text-xl font-bold">Perguntas públicas</h2>
          <div className="space-y-4 w-full max-w-lg">
            {publicQuestions.map((question) => (
              <div key={question.id} className="border rounded-md p-3 w-full">
                <p>{question.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
