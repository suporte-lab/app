import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useQuery } from "@tanstack/react-query";
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
import { MoreHorizontal } from "lucide-react";
import { getProjectsListFn } from "@/server/services/project/functions";
import { getMunicipalitiesOptions } from "@/server/services/municipality/options";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  getProjectCategoriesOptions,
  getProjectsListOptions,
} from "@/server/services/project/options";

type RowDTO = Awaited<ReturnType<typeof getProjectsListFn>>[number];

export const columns: ColumnDef<RowDTO>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <span className="truncate block">{row.original.name}</span>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
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
    header: "Municipality",
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
  {
    accessorKey: "actions",
    header: "",
    size: 24,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Actions />
      </div>
    ),
  },
];

export function ResearchProjectsDataTable({
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

export function Actions() {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Placeholder</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
