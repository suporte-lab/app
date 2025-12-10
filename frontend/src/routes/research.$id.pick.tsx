import { createFileRoute, Link } from "@tanstack/react-router";
import { RequestResearchLayout } from "@/components/layouts/request-research-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchProjectsOptions, fetchResearchOptions } from "@/lib/api";

export const Route = createFileRoute("/research/$id/pick")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const { data } = useQuery(fetchResearchOptions(id));
  const { data: projects } = useQuery(fetchProjectsOptions());

  const [selected, setSelected] = useState(projects?.[0].id);

  return (
    <RequestResearchLayout>
      <div className="flex flex-col space-y-4 rounded-lg p-6 border bg-white">
        <div className="space-y-1 text-center">
          <h1 className="font-medium text-lg">Escolha a sua unidade</h1>
          <p className="text-xs text-muted-foreground text-balance">
            Use o selecionador abaixo para entrar nas pesquisas da sua unidade.
          </p>
        </div>

        <div className="w-full max-w-10 h-0.5 mx-auto bg-muted"></div>

        <Select value={selected} onValueChange={(id) => setSelected(id)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Formulário" />
          </SelectTrigger>
          <SelectContent>
            {projects
              ?.filter(
                (p) => p.municipalityId === data?.research.municipalityId
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(({ id, name }) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {selected && (
          <Button asChild>
            <Link to="/project/$id/survey" params={{ id: selected }}>
              Acessar unidade
            </Link>
          </Button>
        )}
      </div>
    </RequestResearchLayout>
  );
}
