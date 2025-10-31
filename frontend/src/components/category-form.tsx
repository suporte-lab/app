import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { api, fetchCategoryOptions } from "@/lib/api";
import {
  zodToFieldErrors,
  type PutProjectCategoryParams,
  putProjectCategorySchema,
} from "@server/schemas";
import { Input } from "./ui/input";

export function CategoryForm({ id }: { id?: string }) {
  const queryClient = useQueryClient();
  const { data: category } = useQuery(fetchCategoryOptions(id ?? ""));
  const [open, setOpen] = useState(false);

  const defaultValues: PutProjectCategoryParams = {
    name: category?.name ?? "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = putProjectCategorySchema.safeParse(value);
        return !result.success ? zodToFieldErrors(result.error) : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      let res;

      if (id) {
        res = await api.categories[":id"].$put({ param: { id }, json: value });
      } else {
        res = await api.categories.$post({ json: value });
      }

      if (!res.ok) {
        toast.error("Erro no servidor");
        return;
      }

      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Operaçāo concluida com sucesso");
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
            Defina uma categoria de unidade para categorizar unidades.
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
