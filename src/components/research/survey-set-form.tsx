import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { z } from "zod";
import { setSurveySchema } from "@/server/services/research/schemas";
import { zodToFieldErrors } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FieldError } from "../field-error";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { SurveyDTO } from "@/server/services/research/types";
import { setSurveyFn } from "@/server/services/research/functions";

type Form = z.infer<ReturnType<typeof setSurveySchema>>;

export function SurveySetForm({
  survey,
  open,
  onOpenChange,
  onSuccess,
  trigger,
}: {
  survey?: SurveyDTO;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (id: string) => void;
  trigger?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [openInternal, setOpenInternal] = useState(false);

  const defaultValues: Form = {
    id: survey?.id ?? undefined,
    name: survey?.name ?? "",
  };

  const { mutate } = useMutation({
    mutationFn: setSurveyFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      queryClient.invalidateQueries({ queryKey: ["survey", data.id] });

      setOpenInternal(false);

      setTimeout(() => {
        form.reset(defaultValues);
      }, 100);

      toast.success("Formulário de pesquisa salvo com sucesso");

      onSuccess?.(data.id);
    },
    onError: (error) => console.error(error.message),
  });

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = setSurveySchema().safeParse(value);
        return !result.success ? zodToFieldErrors(result.error) : undefined;
      },
    },
    onSubmit: ({ value }) => {
      mutate({ data: value });
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
