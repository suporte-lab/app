import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/header";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjectsListOptions } from "@/server/services/project/options";
import { getResearchOptions, getResearchQuestionsOptions } from "@/server/services/research/options";
import { ResearchResultDataTable } from "@/components/research/research-result-data-table";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sendResearchRequestEmailFn } from "@/server/services/research/functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { DownloadIcon, File, LinkIcon, Mail } from "lucide-react";
import { getResearchResultsOptions } from "@/server/services/research/options";
import { ResearchImportDialog } from "@/components/research/research-import-dialog";

export const Route = createFileRoute("/__authed/dashboard/research/$id/")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const { data: research } = useQuery(getResearchOptions({ id }));
  const { data: questions } = useQuery(getResearchQuestionsOptions({ id }));
  const { data: projects } = useQuery(getProjectsListOptions({}));
  const { data: results } = useQuery(getResearchResultsOptions({ id }));

  const sendMailRequest = useServerFn(sendResearchRequestEmailFn);

  function generateData() {
    const output: { [key: string]: string | number }[] = [];

    if (!results) return output;

    for (const [projectId, result] of Object.entries(results.results)) {
      const project = projects?.find((p) => p.id === projectId);
      if (!project) continue;

      const row = {
        Nome: project.name,
      };

      for (const questionId of Object.keys(results.questions)) {
        const question = results.questions[questionId];
        row[question] = result[questionId]?.join(", ") ?? "";
      }

      output.push(row);
    }

    return output;
  }

  function generateImportCSV() {
    if (!questions || !projects) return
    const headers = "Unidade," + questions.questions.map(q => q.question).join(",") + "\n"
    const rows = projects.map(p => p.name).join(",\n")
    const csv = headers + rows

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a");
    a.href = url
    a.download = "import.csv"
    a.click()

    window.URL.revokeObjectURL(url);
  }

  function downloadCSV() {
    const data = generateData();

    const headers = Object.keys(generateData()[0]).join(",") + "\n";
    const rows = data.map((obj) => Object.values(obj).join(",")).join("\n");
    const csv = headers + rows;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (!research || !projects) {
    return (
      <DashboardLayout title="Pesquisa">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={"Pesquisa"}>
      <DashboardHeader
        title={research.name}
        right={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/research/${research.id}/pick`)
                toast.success("Link de envio copiado");
              }}
            >
              <LinkIcon />
              Enviar link
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                sendMailRequest({ data: { id } }).then(() => {
                  toast.success("Emails enviados");
                })
              }
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
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Completo</CardTitle>
          <CardDescription>Projetos que foram completados</CardDescription>
        </CardHeader>

        <CardContent>
          <ResearchResultDataTable researchId={id} type="completed" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Faltando</CardTitle>
          <CardDescription>Projetos que faltam na pesquisa</CardDescription>
        </CardHeader>

        <CardContent>
          <ResearchResultDataTable researchId={id} type="missing" />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
