import {
  api,
  fetchCategoryOptions,
  fetchMunicipalityOptions,
  fetchProjectsOptions,
} from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { DataTable } from "./ui/data-table";
import { useState } from "react";
import { toast } from "sonner";
import { ProjectForm } from "./project-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { ConfirmDialog } from "./confirm-dialog";

export const columns: ColumnDef<{
  id: string;
  name: string;
  responsibleName?: string | null;
  categoryId: string;
  municipalityId: string;
}>[] = [
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
      const { data: category } = useQuery(
        fetchCategoryOptions(row.original.categoryId)
      );

      return (
        <Button
          variant="outline"
          size="xs"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!category) return;

            navigate({
              to: "/dashboard/category/$id",
              params: { id: category.id },
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
      const { data: municipality } = useQuery(
        fetchMunicipalityOptions(row.original.municipalityId)
      );

      return (
        <Button
          variant="outline"
          size="xs"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!municipality) return;

            navigate({
              to: "/dashboard/municipality/$id",
              params: { id: municipality.id },
            });
          }}
        >
          {municipality?.name}
        </Button>
      );
    },
  },
];

export function ProjectTable({
  categoryId,
  municipalityId,
}: {
  categoryId?: string;
  municipalityId?: string;
}) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(fetchProjectsOptions());

  if (isLoading)
    return (
      <div className="space-y-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  let list = data ?? [];

  if (categoryId) {
    list = list.filter((project) => project.categoryId === categoryId);
  }

  if (municipalityId) {
    list = list.filter((project) => project.municipalityId === municipalityId);
  }

  return (
    <DataTable
      columns={columns}
      data={list}
      onRowClick={(row) => {
        navigate({
          to: "/dashboard/project/$id",
          params: { id: row.id },
        });
      }}
    />
  );
}

export function ProjectActions({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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

      <ProjectForm
        id={id}
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
        onConfirm={async () => {
          setOpen(false);

          const res = await api.projects[":id"].$delete({
            param: { id },
          });

          if (!res.ok) {
            return toast.error("Error servidor");
          }

          queryClient.invalidateQueries({ queryKey: ["projects"] });
          toast.success("Projeto deletado");

          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        title="Deletar projeto"
        description={`Tem certeza que deseja deletar?`}
      />
    </>
  );
}
