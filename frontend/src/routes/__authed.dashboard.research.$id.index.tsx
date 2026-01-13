import { createFileRoute, useRouter } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DownloadIcon, Edit, LinkIcon, Mail, Trash2 } from "lucide-react";
import { api, fetchProjectsOptions, fetchResearchOptions } from "@/lib/api";
import { ResearchResultsTable } from "@/components/research-results-table";
import { ResearchImportDialog } from "@/components/research-import-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ResearchForm } from "@/components/research-form";
import { csvEscape } from "@/lib/utils";
import { formatDate } from "date-fns";

export const Route = createFileRoute("/__authed/dashboard/research/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const ctx = Route.useRouteContext();
  const { id } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useQuery(fetchResearchOptions(id));
  const { data: projects } = useQuery(fetchProjectsOptions());

  function generateData() {
    const output: { [key: string]: string | number }[] = [];

    if (!data) return output;

    for (const [projectId, results] of Object.entries(data.results)) {
      const project = projects?.find((p) => p.id === projectId);
      if (!project) continue;

      const row: Record<string, string> = {
        Nome: project.name,
      };

      console.log(results);
      for (const questionId of Object.keys(results)) {
        if (questionId === "createdAt") continue;

        const question = data.questions[questionId];
        row[question] = results[questionId]?.join(", ") ?? "";
      }

      row["Data de envio"] = formatDate(
        results.createdAt.join(""),
        "dd-MM-yyyy"
      );

      output.push(row);
    }

    return output;
  }

  function downloadCSV() {
    const data = generateData();
    if (!data.length) return;

    const headers = Object.keys(data[0]).map(csvEscape).join(",") + "\n";

    const rows = data
      .map((obj) => Object.values(obj).map(csvEscape).join(","))
      .join("\n");

    const csv = headers + rows;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  }

  if (!data || !projects) {
    return (
      <DashboardLayout auth={ctx.auth} title="Pesquisa">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout auth={ctx.auth} title={"Pesquisa"}>
      <DashboardHeader
        title={`${formatDate(data.research.createdAt, "dd-MM-yyyy")} | ${data.research.name}`}
        right={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/research/${data.research.id}/pick`
                );
                toast.success("Link de envio copiado");
              }}
            >
              <LinkIcon />
              Enviar link
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const res = await api.researchs[":id"].mail.$post({
                  param: { id },
                });

                if (!res.ok) {
                  toast.error("Erro servidor");
                  return;
                }

                toast.success("Emails enviados com sucesso");
              }}
            >
              <Mail />
              Enviar email
            </Button>
            <ResearchImportDialog researchId={id}>
              <Button variant="secondary">
                <DownloadIcon />
                Importar
              </Button>
            </ResearchImportDialog>
            <Button
              onClick={() => {
                downloadCSV();
              }}
            >
              <DownloadIcon />
              Exportar
            </Button>
            <ResearchForm
              id={data.research.id}
              trigger={
                <Button variant="outline" size="icon">
                  <Edit className="size-4" />
                </Button>
              }
            />
            <ConfirmDialog
              title="Deletar pesquisa"
              onConfirm={async () => {
                const res = await api.researchs[":id"].$delete({
                  param: { id },
                });

                if (!res.ok) {
                  return toast.error("Error servidor");
                }

                toast.success("Apagado com sucesso.");
                queryClient.invalidateQueries({ queryKey: ["researchs"] });
                router.navigate({ to: "/dashboard/research" });
              }}
            >
              <Button variant="outline" size="icon">
                <Trash2 className="size-4" />
              </Button>
            </ConfirmDialog>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Completo</CardTitle>
          <CardDescription>Unidades que foram completados</CardDescription>
        </CardHeader>

        <CardContent>
          <ResearchResultsTable researchId={id} type="completed" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Faltando</CardTitle>
          <CardDescription>Unidades que faltam na pesquisa</CardDescription>
        </CardHeader>

        <CardContent>
          <ResearchResultsTable researchId={id} type="missing" />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
