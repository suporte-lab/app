import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { api, fetchSurveysOptions } from "@/lib/api";
import { SurveyForm } from "./survey-form";

export const columns: ColumnDef<{
  id: string;
  name: string;
  createdAt: string;
}>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      return <span>{row.original.name}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => {
      return (
        <span className="text-xs">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    size: 24,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <SurveyActions id={row.original.id} />
        </div>
      );
    },
  },
];

export function SurveyTable() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(fetchSurveysOptions());

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
          to: "/dashboard/survey/$id",
          params: { id: row.id },
        });
      }}
    />
  );
}

export function SurveyActions({ id }: { id: string }) {
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
        </DropdownMenuContent>
      </DropdownMenu>

      <SurveyForm
        id={id}
        open={editOpen}
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

          const res = await api.surveys[":id"].$delete({
            param: { id },
          });

          if (!res.ok) {
            return toast.error("Error servidor");
          }

          queryClient.invalidateQueries({ queryKey: ["projects"] });
          toast.success("Questionário deletado");
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        title="Deletar questionário"
        description={`Tem certeza que deseja deletar?`}
      />
    </>
  );
}
