import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  fetchProjectsOptions,
  fetchResearchOptions,
  fetchResearchsOptions,
} from "@/lib/api";

export const columns: ColumnDef<{
  id: string;
  name: string;
  createdAt: string;
}>[] = [
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {format(row.original.createdAt, "dd-MM-yyyy")}
        </span>
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
    accessorKey: "completed",
    header: "Completo",
    cell: ({ row }) => {
      const { data: projectsData } = useQuery(fetchProjectsOptions());
      const { data } = useQuery(fetchResearchOptions(row.original.id));

      const projects = projectsData?.filter(
        (p) => p.municipalityId === data?.research.municipalityId
      );

      const completed = Object.keys(data?.results ?? {}).length ?? 0;
      const total = projects?.length ?? 0;

      return (
        <Badge
          variant={(() => {
            if (completed == total) {
              return "success";
            } else if (completed > 0) {
              return "info";
            } else {
              return "outline";
            }
          })()}
        >
          {completed}
        </Badge>
      );
    },
  },
  {
    accessorKey: "missing",
    header: "Faltando",
    cell: ({ row }) => {
      const { data: projectsData } = useQuery(fetchProjectsOptions());
      const { data } = useQuery(fetchResearchOptions(row.original.id));

      const projects = projectsData?.filter(
        (p) => p.municipalityId === data?.research.municipalityId
      );

      const completed = Object.keys(data?.results ?? {}).length ?? 0;

      let notCompleted = 0;
      for (let p of projects ?? []) {
        if (!data?.results[p.id]) notCompleted++;
      }

      console.log(notCompleted, completed, projects?.length);
      const missing = Math.max(0, (projects?.length ?? 0) - completed);

      return (
        <Badge
          variant={(() => {
            if (missing == 0) {
              return "success";
            } else if (missing > 0) {
              return "warning";
            } else {
              return "outline";
            }
          })()}
        >
          {missing ?? 0}
        </Badge>
      );
    },
  },
];

export function ResearchTable() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery(fetchResearchsOptions());

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
          to: "/dashboard/research/$id",
          params: { id: row.id },
        });
      }}
    />
  );
}
