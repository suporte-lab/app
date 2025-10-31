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
  putSurveySchema,
  zodToFieldErrors,
  type PutSurveyParams,
} from "@server/schemas";
import { api, fetchSurveyOptions } from "@/lib/api";

export function SurveyForm({
  id,
  open,
  onOpenChange,
  trigger,
}: {
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (id: string) => void;
  trigger?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [openInternal, setOpenInternal] = useState(false);
  const { data: survey } = useQuery(fetchSurveyOptions(id ?? ""));

  const defaultValues: PutSurveyParams = {
    name: survey?.name ?? "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = putSurveySchema.safeParse(value);
        return !result.success ? zodToFieldErrors(result.error) : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      let res;
      if (id) {
        res = await api.surveys[":id"].$put({ param: { id }, json: value });
      } else {
        res = await api.surveys.$post({ json: { ...value } });
      }

      if (!res.ok) {
        toast.error("Erro servidor");
        return;
      }

      setOpenInternal(false);
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
          <DialogTitle>Formulário de pesquisa</DialogTitle>
          <DialogDescription>
            Crie um formulário de pesquisa para coletar dados.
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
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Nome</Label>

                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />

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
