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
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../confirm-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { ProjectDTO } from "@/server/services/project/types";
import {
  getProjectsListFn,
  softDeleteProjectFn,
} from "@/server/services/project/functions";
import { ProjectSetForm } from "./project-set-form";
import { getMunicipalitiesOptions } from "@/server/services/municipality/options";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  getProjectCategoriesOptions,
  getProjectsListOptions,
} from "@/server/services/project/options";

type RowDTO = Awaited<ReturnType<typeof getProjectsListFn>>[number];

export const columns: ColumnDef<RowDTO>[] = [
  {
    accessorKey: "responsibleName",
    header: "Responsável",
    cell: ({ row }) => {
      return (
        <span className="font-medium truncate block text-slate-800">
          {row.original.responsibleName}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      return <span className="truncate block">{row.original.name}</span>;
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    size: 96,
    cell: ({ row }) => {
      const navigate = useNavigate();
      const { data: categories } = useQuery(getProjectCategoriesOptions());

      const category = categories?.find(
        (c) => c.id === row.original.categoryId
      );

      return (
        <Button
          variant="outline"
          size="xs"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            navigate({
              to: "/dashboard/category/$id",
              params: { id: category?.id ?? "" },
            });
          }}
        >
          {category?.name}
        </Button>
      );
    },
  },

  {
    accessorKey: "municipality",
    header: "Município",
    size: 96,
    cell: ({ row }) => {
      const navigate = useNavigate();
      const { data: municipalities } = useQuery(getMunicipalitiesOptions());

      const municipality = municipalities?.find(
        (m) => m.id === row.original.municipalityId
      );

      return (
        <Button
          variant="outline"
          size="xs"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            navigate({
              to: "/dashboard/municipality/$id",
              params: { id: municipality?.id ?? "" },
            });
          }}
        >
          {municipality?.name}
        </Button>
      );
    },
  },
];

export function ProjectDataTable({
  categoryId,
  municipalityId,
}: {
  categoryId?: string;
  municipalityId?: string;
}) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(
    getProjectsListOptions({
      categoryId,
      municipalityId,
    })
  );

  if (isLoading)
    return (
      <div className="space-y-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      onRowClick={(row) => {
        navigate({
          to: "/dashboard/project/$id",
          params: { id: row.id },
        });
      }}
    />
  );
}

export function ProjectActions({ project }: { project: ProjectDTO }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { mutate: deleteProject } = useMutation({
    mutationFn: () => softDeleteProjectFn({ data: { id: project.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProjectSetForm
        project={project}
        open={editOpen}
        trigger={false}
        onOpenChange={(open) => {
          setEditOpen(open);
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        onSuccess={() => {
          setEditOpen(false);
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
      />

      <ConfirmDialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        onConfirm={() => {
          setOpen(false);
          deleteProject();
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        title="Deletar projeto"
        description={`Tem certeza que deseja deletar ${project.name}?`}
      />
    </>
  );
}
