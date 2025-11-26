import { createFileRoute, useRouter } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Plus, Trash2Icon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  api,
  fetchSurveyOptions,
  fetchSurveyQuestionsOptions,
} from "@/lib/api";
import { SurveyForm } from "@/components/survey-form";
import { SurveyFillable } from "@/components/survey-fillable";
import { SurveyQuestionForm } from "@/components/survey-question-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/__authed/dashboard/survey/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const ctx = Route.useRouteContext();
  const { id } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: survey } = useQuery(fetchSurveyOptions(id));
  const { data: questions } = useQuery(fetchSurveyQuestionsOptions(id));

  if (!survey) {
    return (
      <DashboardLayout auth={ctx.auth} title="Survey">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  const publicQuestions = questions?.filter((question) => question.isPublic);

  return (
    <DashboardLayout auth={ctx.auth} title={survey.name}>
      <DashboardHeader
        title={survey.name}
        right={
          <>
            <SurveyForm
              id={survey.id}
              trigger={<Button variant="outline">Editar</Button>}
            />
            <SurveyQuestionForm
              surveyId={id}
              trigger={
                <Button>
                  <Plus />
                  Adicionar pergunta
                </Button>
              }
            />
            <ConfirmDialog
              title="Deletar formulário"
              onConfirm={async () => {
                const res = await api.surveys[":id"].$delete({
                  param: { id },
                });

                if (!res.ok) {
                  return toast.error("Error servidor");
                }

                toast.success("Apagado com sucesso.");
                queryClient.invalidateQueries({ queryKey: ["surveys"] });
                router.navigate({ to: "/dashboard/survey" });
              }}
            >
              <Button variant="outline" size="icon">
                <Trash2Icon />
              </Button>
            </ConfirmDialog>
          </>
        }
      />
      <div className="p-16 pb-24 flex flex-col text-center items-center justify-center border border-dashed rounded-md gap-16">
        <SurveyFillable id={id} edit />
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
