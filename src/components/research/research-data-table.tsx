import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { ResearchDTO } from "@/server/services/research/types";
import {
  getResearchResultsOptions,
  getResearchsListOptions,
} from "@/server/services/research/options";
import { useNavigate } from "@tanstack/react-router";
import { getProjectsListOptions } from "@/server/services/project/options";
import { Badge } from "../ui/badge";
import { format } from "date-fns";

export const columns: ColumnDef<ResearchDTO>[] = [
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
      const { data: projectsData } = useQuery(getProjectsListOptions({}));
      const { data } = useQuery(
        getResearchResultsOptions({ id: row.original.id })
      );

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
      const { data: projectsData } = useQuery(getProjectsListOptions({}));
      const { data } = useQuery(
        getResearchResultsOptions({ id: row.original.id })
      );

      const projects = projectsData?.filter(
        (p) => p.municipalityId === data?.research.municipalityId
      );

      const completed = Object.keys(data?.results ?? {}).length ?? 0;
      const notCompleted = projects?.filter((p) => !data?.[p.id]).length ?? 0;

      const missing = notCompleted - completed;

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

export function ResearchDataTable() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery(getResearchsListOptions());

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
