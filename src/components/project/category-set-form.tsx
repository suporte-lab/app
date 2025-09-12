import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Edit, Plus } from "lucide-react";
import { z } from "zod";
import { setProjectCategorySchema } from "@/server/services/project/schemas";
import { zodToFieldErrors } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FieldError } from "../field-error";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { ProjectCategoryDTO } from "@/server/services/project/types";
import { setProjectCategoryFn } from "@/server/services/project/functions";

type Form = z.infer<ReturnType<typeof setProjectCategorySchema>>;

export function ProjectCategorySetForm({
  category,
}: {
  category?: ProjectCategoryDTO;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const defaultValues: Form = {
    id: category?.id ?? undefined,
    name: category?.name ?? "",
  };

  const { mutate } = useMutation({
    mutationFn: setProjectCategoryFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-categories"] });

      setOpen(false);

      setTimeout(() => {
        form.reset(defaultValues);
      }, 100);

      toast.success("Project category set successfully");
    },
    onError: (error) => console.error(error.message),
  });

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = setProjectCategorySchema().safeParse(value);
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
      <DialogTrigger asChild>
        <Button variant={category ? "default" : "outline"}>
          {category ? <Edit /> : <Plus />}
          {category ? "Editar" : "Adicionar categoria"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir categoria</DialogTitle>
          <DialogDescription>
            Defina uma categoria de projeto para categorizar projetos.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-3">
            <form.Field
              name="name"
              children={(field) => (
                <div className="grid gap-3">
                  <Label htmlFor={field.name}>Nome</Label>

                  <div className="space-y-2">
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
