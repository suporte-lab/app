import { createFileRoute, Link } from "@tanstack/react-router";
import { RequestResearchLayout } from "@/components/layouts/request-research-layout";
import { db } from "@/server/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { Button } from "@/components/ui/button";

const getProjects = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data }) => {
    const research = await db.selectFrom("research").select("municipalityId").where("id", "=", data).executeTakeFirstOrThrow()
    const projects = await db.selectFrom("project").select(["id", "name"]).where("municipalityId", "=", research.municipalityId).orderBy("name", "asc").execute()

    return projects
  })

export const Route = createFileRoute("/research/$id/pick")({
  beforeLoad: async ({ params }) => {
    const projects = await getProjects({ data: params.id })

    return { projects }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { projects } = Route.useRouteContext()

  const [selected, setSelected] = useState(projects[0].id)

  return (
    <RequestResearchLayout>
      <div className="flex flex-col space-y-4 rounded-lg p-6 border bg-white">
        <div className="space-y-1 text-center">
          <h1 className="font-medium text-lg">Escolha o seu projeto</h1>
          <p className="text-xs text-muted-foreground text-balance">Use o selecionador abaixo para entrar nas pesquisas do seu projeto.</p>
        </div>

        <div className="w-full max-w-10 h-0.5 mx-auto bg-muted"></div>

        <Select value={selected} onValueChange={(id) => setSelected(id)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Formulário" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map(({ id, name }) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild>
          <Link to="/project/$id/survey" params={{ id: selected }}>
            Acessar projeto
          </Link>

        </Button>
      </div>
    </RequestResearchLayout>
  );
}
