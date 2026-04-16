import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../confirm-dialog";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ProjectCategoryDTO } from "@/server/services/project/types";
import { softDeleteProjectCategoryFn } from "@/server/services/project/functions";
import { getProjectCategoriesOptions } from "@/server/services/project/options";

export const columns: ColumnDef<ProjectCategoryDTO>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      return <span>{row.original.name}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <ProjectCategoryActions category={row.original} />
        </div>
      );
    },
  },
];

export function ProjectCategoryDataTable() {
  const { data, isLoading } = useQuery(getProjectCategoriesOptions());

  if (isLoading)
    return (
      <div className="space-y-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todas as categorias de projeto</CardTitle>
        <CardDescription>{data?.length} resultados encontrados</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data ?? []} />
      </CardContent>
    </Card>
  );
}

export function ProjectCategoryActions({
  category,
}: {
  category: ProjectCategoryDTO;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { mutate: deleteProjectCategory } = useMutation({
    mutationFn: () =>
      softDeleteProjectCategoryFn({ data: { id: category.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-categories"] });
      toast.success("Categoria de projeto deletada");
    },
  });

  return (
    <>
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
          deleteProjectCategory();
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        title="Deletar categoria de projeto"
        description={`Tem certeza que deseja deletar ${category.name}?`}
      />
    </>
  );
}
