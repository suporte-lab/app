import {
  setSurveyAnswerFn,
  setSurveyQuestionsOrderFn,
  softDeleteSurveyQuestionFn,
} from "@/server/services/research/functions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SurveyFormInput } from "./survey-form-input";
import { Card } from "../ui/card";
import { format } from "date-fns";
import { Skeleton } from "../ui/skeleton";
import { Edit, GripVertical, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { ConfirmDialog } from "../confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import { SurveyQuestionSetForm } from "./survey-question-set-form";
import {
  getSurveyQuestionsOptions,
  getSurveyOptions,
  getSurveyAnswersByProjectIdOptions,
} from "@/server/services/research/options";

export function SurveyForm({
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

  const { data: survey } = useQuery(getSurveyOptions({ id }));
  const { data: questions } = useQuery(getSurveyQuestionsOptions({ id }));
  const { data: answers } = useQuery(
    getSurveyAnswersByProjectIdOptions({
      researchId: researchId ?? "",
      projectId: projectId ?? "",
    })
  );

  const [results, setResults] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: setSurveyQuestionsOrder } = useMutation({
    mutationFn: setSurveyQuestionsOrderFn,
  });

  const { mutate: setSurveyAnswer } = useMutation({
    mutationFn: setSurveyAnswerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["researchs", researchId, "results"],
      });

      onSuccess?.();
    },
  });

  const [list, setList] = useState(questions ?? []);

  useEffect(() => {
    setSurveyQuestionsOrder({
      data: { surveyId: id, questions: list.map((q) => q.id) },
    });
  }, [list]);

  useEffect(() => {
    setList(questions ?? []);
  }, [questions]);

  function handleSubmit() {
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

    setSurveyAnswer({
      data: {
        surveyId: id,
        projectId: projectId,
        researchId: researchId,
        answers: Object.entries(results).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      },
    });
  }

  useEffect(() => {
    if (answers) {
      const formValues = {};

      for (const answer of answers) {
        formValues[answer.questionId] = answer.answer;
      }

      setResults(formValues);
    }
  }, [answers]);

  if (!survey) {
    return <Skeleton className="aspect-[4/3] w-full max-w-lg" />;
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
          animation={200}
          className="space-y-6"
        >
          {list.map((question) => (
            <div key={question.id} className="flex gap-2 items-end">
              <Button variant="ghost" size="icon">
                <GripVertical />
              </Button>
              <div className="flex-1">
                <SurveyFormInput
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
            <SurveyFormInput
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

  const { mutate: deleteQuestion } = useMutation({
    mutationFn: () => softDeleteSurveyQuestionFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["survey", surveyId, "questions"],
      });
      toast.success("Pergunta deletada");
    },
  });
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
        onConfirm={() => {
          setOpen(false);
          deleteQuestion();
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        title="Deletar pergunta"
        description={`Tem certeza que deseja deletar esta pergunta?`}
      />

      <SurveyQuestionSetForm
        open={openEdit}
        onOpenChange={(open) => {
          setOpenEdit(open);
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        onSuccess={() => {
          setOpenEdit(false);
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);

          queryClient.invalidateQueries({
            queryKey: ["survey", surveyId, "questions"],
          });

          toast.success("Pergunta atualizada");
        }}
        surveyId={surveyId}
        questionId={id}
      />
    </div>
  );
}
