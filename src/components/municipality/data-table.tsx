import { MunicipalityDTO } from "@/server/services/municipality/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { getMunicipalitiesOptions } from "@/server/services/municipality/options";
import { useNavigate } from "@tanstack/react-router";

export const columns: ColumnDef<MunicipalityDTO>[] = [
  {
    accessorKey: "state",
    header: "Estado",
    cell: ({ row }) => {
      return (
        <span className="font-medium text-slate-800">{row.original.state}</span>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Município",
    cell: ({ row }) => {
      return <span>{row.original.name}</span>;
    },
  },
];

export function MunicipalityDataTable() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(getMunicipalitiesOptions());

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      onRowClick={(row) =>
        navigate({ to: "/dashboard/municipality/$id", params: { id: row.id } })
      }
    />
  );
}
