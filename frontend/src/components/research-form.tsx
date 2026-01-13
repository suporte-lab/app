import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { SurveySelect } from "@/components/survey-select";
import { MunicipalitySelect } from "@/components/municipality-select";
import {
  setResearchSchema,
  zodToFieldErrors,
  type SetResearchParams,
} from "@server/schemas";
import { api, fetchResearchOptions } from "@/lib/api";
import { DatePicker } from "./date-picker";

export function ResearchForm({
  id,
  trigger,
}: {
  id?: string;
  trigger?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery(fetchResearchOptions(id ?? ""));

  const defaultValues: SetResearchParams = {
    createdAt: data?.research?.createdAt
      ? new Date(data.research.createdAt).toISOString()
      : new Date().toISOString(),
    name: data?.research?.name ?? "",
    slug: data?.research?.slug ?? "",
    surveyId: data?.research?.surveyId ?? "",
    municipalityId: data?.research?.municipalityId ?? "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = setResearchSchema.safeParse(value);
        return !result.success ? zodToFieldErrors(result.error) : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      let res;

      if (id) {
        res = await api.researchs[":id"].$put({
          json: value,
          param: { id },
        });
      } else {
        res = await api.researchs.$post({ json: value });
      }

      if (!res.ok) {
        toast.error("Erro servidor");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["researchs"] });
      toast.success("Operaçāo concluida com sucesso");
      setOpen(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);

        setTimeout(() => {
          form.reset(defaultValues);
        }, 100);
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pesquisa</DialogTitle>
          <DialogDescription>
            Crie uma nova pesquisa para todos as suas unidades.
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
                name="createdAt"
                children={(field) => {
                  const dateValue = field.state.value
                    ? new Date(field.state.value)
                    : undefined;

                  return (
                    <div className="grid gap-3">
                      <Label>Data</Label>

                      <DatePicker
                        value={dateValue}
                        onChange={(date) => {
                          field.handleChange(date ? date.toISOString() : "");
                        }}
                      />

                      <FieldError error={field.state.meta.errors?.join(", ")} />
                    </div>
                  );
                }}
              />

              <form.Field
                name="name"
                children={(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Nome</Label>

                    <div className="space-y-2">
                      <Input
                        value={field.state.value}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          form.setFieldValue("slug", slugify(e.target.value));
                        }}
                      />
                    </div>

                    <FieldError error={field.state.meta.errors?.join(", ")} />
                  </div>
                )}
              />

              <form.Field
                name="slug"
                children={(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Identificador</Label>

                    <div className="space-y-2">
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled
                      />
                    </div>

                    <FieldError error={field.state.meta.errors?.join(", ")} />
                  </div>
                )}
              />

              <form.Field
                name="surveyId"
                children={(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Formulário de pesquisa</Label>

                    <div className="space-y-2">
                      <SurveySelect
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                      />
                    </div>

                    <FieldError error={field.state.meta.errors?.join(", ")} />
                  </div>
                )}
              />

              <form.Field
                name="municipalityId"
                children={(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Municipio</Label>

                    <div className="space-y-2">
                      <MunicipalitySelect
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                      />
                    </div>

                    <FieldError error={field.state.meta.errors?.join(", ")} />
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
