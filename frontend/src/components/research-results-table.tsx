import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SurveyFillableResult } from "@/components/survery-fillable-result";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { fetchProjectsOptions, fetchResearchOptions } from "@/lib/api";

type RowDTO = {
  id: string;
  name: string;
  status: string;
};

export const columns: ColumnDef<RowDTO>[] = [
  {
    accessorKey: "status",
    header: "Status",
    size: 16,
    cell: ({ row }) => {
      const label =
        row.original.status === "completed" ? "Completo" : "Faltando";

      return (
        <Badge
          variant={row.original.status === "completed" ? "success" : "warning"}
        >
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      return <span className="text-sm font-medium">{row.original.name}</span>;
    },
  },
  {
    id: "actions",
    size: 24,
    cell: ({ row }) => {
      return (
        <div
          className="flex justify-end"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Actions projectId={row.original.id} />
        </div>
      );
    },
  },
];

export function ResearchResultsTable({
  researchId,
  type,
}: {
  researchId: string;
  type: "missing" | "completed";
}) {
  const [projectId, setProjectId] = useState<string | null>(null);

  const { data: projects } = useQuery(fetchProjectsOptions());
  const { data } = useQuery(fetchResearchOptions(researchId));

  let rows: RowDTO[] = [];

  for (const project of projects ?? []) {
    if (project.municipalityId !== data?.research.municipalityId) {
      continue;
    }

    if (type === "missing" && data?.results?.[project.id]) {
      continue;
    }

    if (type === "completed" && !data?.results?.[project.id]) {
      continue;
    }

    rows.push({
      id: project.id,
      name: project.name,
      status: type,
    });
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        onRowClick={(row) => {
          if (row.status === "completed") {
            setProjectId(row.id);
          }
        }}
      />
      <Dialog
        open={!!projectId}
        onOpenChange={(open) => {
          if (!open) setProjectId(null);
        }}
      >
        <DialogContent className="p-0 border-none rounded-xl">
          <DialogTitle className="sr-only">Resultado da pesquisa</DialogTitle>
          <DialogDescription className="sr-only">
            Visualize o resultado da pesquisa para o projeto
          </DialogDescription>
          <SurveyFillableResult
            projectId={projectId ?? ""}
            researchId={researchId}
            onBack={() => setProjectId(null)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function Actions({ projectId }: { projectId: string }) {
  return (
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
        <DropdownMenuItem
          onSelect={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/project/${projectId}/survey`
            );
            toast.success("Link copied to clipboard");
          }}
        >
          <Link className="mr-2 h-4 w-4" />
          Copiar link da pesquisa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
