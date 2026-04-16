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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { SurveyDTO } from "@/server/services/research/types";
import { getSurveysListOptions } from "@/server/services/research/options";
import { Link, useNavigate } from "@tanstack/react-router";
import { softDeleteSurveyFn } from "@/server/services/research/functions";
import { SurveySetForm } from "./survey-set-form";

export const columns: ColumnDef<SurveyDTO>[] = [
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
          <SurveyActions survey={row.original} />
        </div>
      );
    },
  },
];

export function SurveyDataTable() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery(getSurveysListOptions());

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

export function SurveyActions({ survey }: { survey: SurveyDTO }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { mutate: deleteSurvey } = useMutation({
    mutationFn: () => softDeleteSurveyFn({ data: { id: survey.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      toast.success("Pesquisa deletada");
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

      <SurveySetForm
        survey={survey}
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
        onConfirm={() => {
          setOpen(false);
          deleteSurvey();
          setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
        title="Deletar pesquisa"
        description={`Tem certeza que deseja deletar ${survey.name}?`}
      />
    </>
  );
}
