import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchProjectsOptions,
  fetchResearchOptions,
  fetchResearchsOptions,
  fetchMunicipalitiesOptions,
} from "@/lib/api";

export const columns: ColumnDef<{
  id: string;
  name: string;
  createdAt: string;
  municipalityId: string;
}>[] = [
  {
    accessorKey: "createdAt",
    header: "Data",
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
      return <span className="text-sm font-medium truncate block max-w-[200px]" title={row.original.name}>{row.original.name}</span>;
    },
  },
  {
    accessorKey: "municipality",
    header: "Município",
    cell: ({ row }) => {
      const { data: municipalities } = useQuery(fetchMunicipalitiesOptions());
      const municipality = municipalities?.find(m => m.id === row.original.municipalityId);
      return <span className="text-sm truncate block max-w-[150px]" title={municipality?.name || "N/A"}>{municipality?.name || "N/A"}</span>;
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
  {
    id: "download",
    header: "Download",
    cell: ({ row }) => {
      const { data: researchData } = useQuery(fetchResearchOptions(row.original.id));
      const { data: projects } = useQuery(fetchProjectsOptions());

      const downloadCSV = () => {
        if (!researchData || !projects) return;

        const municipalityProjects = projects.filter(
          (p) => p.municipalityId === researchData.research.municipalityId
        );

        const output: { [key: string]: string | number }[] = [];

        for (const project of municipalityProjects) {
          const results = researchData.results[project.id] || {};

          const row: Record<string, string> = {
            Nome: project.name,
          };

          for (const questionId of Object.keys(researchData.questions)) {
            const question = researchData.questions[questionId];
            row[question] = results[questionId]?.join(", ") ?? "";
          }

          output.push(row);
        }

        if (output.length === 0) {
          // If no projects, create a header-only CSV
          const headers = ["Nome", ...Object.values(researchData.questions)].map(h => `"${h}"`).join(",") + "\n";
          const csv = headers;

          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${researchData.research.name}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          return;
        }

        const headers = Object.keys(output[0]).map(h => `"${h}"`).join(",") + "\n";
        const rows = output.map((obj) => Object.values(obj).map(v => `"${v}"`).join(",")).join("\n");
        const csv = headers + rows;

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${researchData.research.name}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      };

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            downloadCSV();
          }}
          disabled={!researchData || !projects}
        >
          <DownloadIcon className="h-4 w-4" />
        </Button>
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
