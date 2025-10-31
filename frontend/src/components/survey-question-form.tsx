import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SurveyFillableInput } from "@/components/survey-fillable-input";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { api, fetchSurveyQuestionsOptions } from "@/lib/api";
import {
  putSurveyQuestionSchema,
  zodToFieldErrors,
  type PutSurveyQuestionParams,
} from "@server/schemas";

export function SurveyQuestionForm({
  surveyId,
  questionId,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: {
  surveyId: string;
  questionId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [openInternal, setOpenInternal] = useState(false);

  const { data: questions } = useQuery(fetchSurveyQuestionsOptions(surveyId));

  const question = questions?.find((q) => q.id === questionId);

  const defaultValues: PutSurveyQuestionParams = {
    surveyId,
    question: question?.question ?? "",
    description: question?.description ?? "",
    type: question?.type ?? "text",
    visibility: question?.isPublic ?? false,
    options:
      question?.metadata
        .filter((m) => m.type === "select-option")
        .map((m) => ({ id: m.id, value: m.value ?? "" })) ?? [],
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = putSurveyQuestionSchema.safeParse(value);
        return !result.success ? zodToFieldErrors(result.error) : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      const res = await api.surveys[":id"].questions.$post({
        param: { id: surveyId },
        json: { ...value, id: questionId },
      });

      if (!res.ok) {
        toast.error("Erro servidor");
        return;
      }

      setOpenInternal(false);
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      toast.success("Operaçāo concluida com sucesso");
    },
  });

  return (
    <Dialog
      open={open ?? openInternal}
      onOpenChange={(open) => {
        if (onOpenChange) onOpenChange(open);
        setOpenInternal(open);

        setTimeout(() => {
          form.reset(defaultValues);
        }, 100);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pergunta</DialogTitle>
          <DialogDescription>
            Crie ou edite uma pergunta para coleta de dados.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-6">
            <div className="grid gap-3">
              <form.Field
                name="visibility"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Visivel para todos?</Label>

                    <Switch
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                    />

                    <FieldError error={field.state.meta.errors?.join(", ")} />
                  </div>
                )}
              />

              <form.Field
                name="question"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Pergunta</Label>

                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />

                    <FieldError error={field.state.meta.errors?.join(", ")} />
                  </div>
                )}
              />

              <form.Field
                name="description"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Descrição</Label>

                    <Input
                      value={field.state.value}
                      placeholder="Opcional"
                      onChange={(e) => field.handleChange(e.target.value)}
                    />

                    <FieldError error={field.state.meta.errors?.join(", ")} />
                  </div>
                )}
              />

              <form.Subscribe
                selector={(state) => state}
                children={({ values }) => (
                  <div className="space-y-2">
                    <Label>Tipo</Label>

                    <SurveyQuestionTypeSelector
                      value={values.type}
                      options={values.options ?? []}
                      onChange={(value, options) => {
                        form.setFieldValue("type", value);
                        form.setFieldValue("options", options);
                      }}
                      disabled={!!question}
                    />
                  </div>
                )}
              />

              <form.Subscribe
                selector={(state) => state}
                children={({ values }) => (
                  <div className="p-5 border rounded-md border-dashed">
                    <SurveyFillableInput
                      type={values.type ?? "text"}
                      question={values.question ?? ""}
                      description={values.description ?? ""}
                      options={values.options ?? []}
                      preview
                    />
                  </div>
                )}
              />

              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SurveyQuestionTypeSelector({
  value,
  options,
  onChange,
  disabled,
}: {
  value?: string;
  options: { id: string; value: string }[];
  onChange?: (value: string, options: { id: string; value: string }[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <Select
        value={value}
        onValueChange={(value) => onChange?.(value, options)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text">Texto</SelectItem>
          <SelectItem value="number">Número</SelectItem>
          {/* <SelectItem value="date">Date</SelectItem> */}
          <SelectItem value="boolean">Verdadeiro/Falso</SelectItem>
          <SelectItem value="select">Seleção</SelectItem>
        </SelectContent>
      </Select>

      {value === "select" && (
        <div className="space-y-2">
          <Label>Opções</Label>
          {options.map((option, index) => (
            <div key={option.id} className="flex gap-2">
              <Input
                key={option.id}
                placeholder={`Opção ${index + 1}`}
                value={option.value}
                onChange={(e) => {
                  onChange?.(
                    value,
                    options.map((o, i) =>
                      i === index ? { ...o, value: e.target.value } : o
                    )
                  );
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  onChange?.(
                    value,
                    options.filter((o) => o.id !== option.id)
                  );
                }}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="icon"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              onChange?.(value, [
                ...options,
                { id: crypto.randomUUID(), value: "" },
              ]);
            }}
          >
            <PlusIcon className="size-4" />
            Adicionar opção
          </Button>
        </div>
      )}
    </div>
  );
}
