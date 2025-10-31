import { type ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Skeleton } from "./ui/skeleton";
import { DataTable } from "./ui/data-table";
import { api } from "@/lib/api";

export const columns: ColumnDef<{
  id: string;
  state: string;
  name: string;
}>[] = [
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

export function MunicipalityTable() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["municipalities"],
    queryFn: async () => {
      const res = await api.municipalities.$get();
      if (!res.ok) throw new Error("server error");
      return (await res.json()).data;
    },
  });

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
