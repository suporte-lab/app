import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { z } from "zod";
import { setResearchSchema } from "@/server/services/research/schemas";
import { slugify, zodToFieldErrors } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FieldError } from "../field-error";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { SurveySelect } from "./survey-select";
import { setResearchFn } from "@/server/services/research/functions";
import { MunicipalitySelect } from "../municipality/municipality-select";

type Form = z.infer<ReturnType<typeof setResearchSchema>>;

export function ResearchSetForm({ trigger }: { trigger?: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const defaultValues: Form = {
    name: "",
    slug: "",
    surveyId: "",
    municipalityId: "",
  };

  const { mutate } = useMutation({
    mutationFn: setResearchFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["researchs"] });

      setOpen(false);

      setTimeout(() => {
        form.reset(defaultValues);
      }, 100);

      toast.success("Pesquisa salva com sucesso");
    },
    onError: (error) => console.error(error.message),
  });

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = setResearchSchema().safeParse(value);
        return !result.success ? zodToFieldErrors(result.error) : undefined;
      },
    },
    onSubmit: ({ value }) => {
      mutate({ data: value });
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
            Crie uma nova pesquisa para todos os seus projetos.
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
