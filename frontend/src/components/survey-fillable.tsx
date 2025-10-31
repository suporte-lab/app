import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SurveyFillableInput } from "./survey-fillable-input";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, GripVertical, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  api,
  fetchSurveyAnswersOptions,
  fetchSurveyOptions,
  fetchSurveyQuestionsOptions,
} from "@/lib/api";
import { SurveyQuestionForm } from "./survey-question-form";

export function SurveyFillable({
  id,
  projectId,
  researchId,
  preview,
  edit,
  onSuccess,
}: {
  id: string;
  projectId?: string;
  researchId?: string;
  preview?: boolean;
  edit?: boolean;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const { data: survey } = useQuery(fetchSurveyOptions(id));
  const { data: questions } = useQuery(fetchSurveyQuestionsOptions(id));
  const { data: answers } = useQuery(
    fetchSurveyAnswersOptions({
      surveyId: id,
      researchId: researchId ?? "",
      projectId: projectId ?? "",
    })
  );

  const [results, setResults] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [list, setList] = useState(questions ?? []);

  useEffect(() => {
    (async () => {
      const questions = list.map((question) => question.id);
      await api.surveys[":id"].questions.order.$post({
        param: { id },
        json: { questions },
      });
    })();
  }, [list]);

  useEffect(() => {
    console.log("Hello");
    if (questions?.length !== list.length) {
      setList(questions ?? []);
    }
  }, [questions]);

  async function handleSubmit() {
    const errors: Record<string, string> = {};

    for (const question of questions ?? []) {
      if (!results[question.id]) {
        errors[question.id] = "Este campo é obrigatório";
      }
    }

    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!projectId || !researchId) {
      toast.error("Projeto ou pesquisa é obrigatório");
      return;
    }

    const res = await api.surveys[":id"].answers.$post({
      param: { id },
      json: {
        surveyId: id,
        projectId: projectId,
        researchId: researchId,
        answers: Object.entries(results).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      },
    });

    if (!res.ok) {
      toast.error("Erro servidor");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["surveys"] });
    queryClient.invalidateQueries({ queryKey: ["researchs"] });

    onSuccess?.();
  }

  useEffect(() => {
    if (answers) {
      const formValues: Record<string, string> = {};

      for (const answer of answers) {
        formValues[answer.questionId] = answer.answer;
      }

      setResults(formValues);
    }
  }, [answers]);

  if (!survey) {
    return <Skeleton className="aspect-4/3 w-full max-w-lg" />;
  }

  return (
    <Card className="p-8 pb-10 max-w-lg w-full">
      <div className="flex gap-2 justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{survey.name}</h2>
          <div className="w-8 h-1 bg-foreground/10 rounded-full"></div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            {questions?.length ?? 0} pergunta
            {questions?.length === 1 ? "" : "s"}.
          </p>
          <div className="text-sm font-medium">
            {format(new Date(), "dd-MM-yyyy")}
          </div>
        </div>
      </div>

      {edit ? (
        <ReactSortable
          list={list}
          setList={setList}
          onEnd={() => {
            setTimeout(async () => {}, 100);
          }}
          animation={200}
          className="space-y-6"
        >
          {list.map((question) => (
            <div key={question.id} className="flex gap-2 items-end">
              <Button variant="ghost" size="icon">
                <GripVertical />
              </Button>
              <div className="flex-1">
                <SurveyFillableInput
                  key={question.id}
                  type={question.type}
                  question={question.question}
                  description={question.description}
                  options={question.metadata
                    .filter((m) => m.type === "select-option")
                    .map((m) => ({ id: m.id, value: m.value ?? "" }))}
                  preview={preview || edit}
                />
              </div>
              <SurveyFormEditActions id={question.id} surveyId={survey.id} />
            </div>
          ))}
        </ReactSortable>
      ) : (
        <div className="space-y-6">
          {questions?.map((question) => (
            <SurveyFillableInput
              key={question.id}
              type={question.type}
              question={question.question}
              description={question.description}
              options={question.metadata
                .filter((m) => m.type === "select-option")
                .map((m) => ({ id: m.id, value: m.value ?? "" }))}
              preview={preview || edit}
              value={results[question.id]}
              error={errors[question.id]}
              onChange={(value) => {
                setResults((prev) => ({ ...prev, [question.id]: value }));
              }}
            />
          ))}
        </div>
      )}

      <Button disabled={preview || edit} onClick={handleSubmit}>
        Enviar
      </Button>

      <div className="text-sm text-muted-foreground text-center">
        Todos os dados são tratados por @CincoBasico
      </div>
    </Card>
  );
}

function SurveyFormEditActions({
  id,
  surveyId,
}: {
  id: string;
  surveyId: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenEdit(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        onConfirm={async () => {
          setOpen(false);

          const res = await api.surveys[":id"].questions.$delete({
            param: { id },
          });

          if (!res.ok) {
            return toast.error("Error servidor");
          }

          queryClient.invalidateQueries({ queryKey: ["surveys"] });
          toast.success("Pergunta deletada");

          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        title="Deletar pergunta"
        description={`Tem certeza que deseja deletar esta pergunta?`}
      />

      <SurveyQuestionForm
        open={openEdit}
        onOpenChange={(open) => {
          setOpenEdit(open);
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        surveyId={surveyId}
        questionId={id}
        onSuccess={() => setOpenEdit(false)}
      />
    </div>
  );
}
