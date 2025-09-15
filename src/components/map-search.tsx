import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "./ui/button";
import { Map } from "./map";
import {
  Minimize,
  Maximize,
  Lock,
  Unlock,
  FilterIcon,
  Plus,
  Search,
  Flag,
  Building,
  Key,
  Trash,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getMunicipalitiesOptions } from "@/server/services/municipality/options";
import {
  getProjectCategoriesOptions,
  getProjectsListOptions,
} from "@/server/services/project/options";
import { MapMarker } from "./map-marker";
import { ProjectDialog } from "./project/project-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  getQuestionsListOptions,
  getResearchsListOptions,
  getResearchsResultsListOptions,
} from "@/server/services/research/options";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import { MultiSelect } from "./ui/multi-select";
import { ulid } from "ulid";

export function MapSearch({ isPublic }: { isPublic?: boolean }) {
  const [locked, setLocked] = useState(false);

  const { data: municipalities } = useSuspenseQuery(getMunicipalitiesOptions());
  const { data: projects } = useSuspenseQuery(getProjectsListOptions({}));
  const { data: categories } = useSuspenseQuery(getProjectCategoriesOptions());
  const { data: questions } = useSuspenseQuery(getQuestionsListOptions());
  const { data: researchsResults } = useSuspenseQuery(
    getResearchsResultsListOptions()
  );
  const [filterResearchs, setFilterResearchs] = useState<
    {
      id: string;
      researchId: string;
      questionId: string;
      results: string[];
      visible: boolean;
    }[]
  >([]);
  const [filterSearch, setFilterSearch] = useState<string>("");
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>(
    municipalities[0].id
  );

  const municipality = municipalities.find(
    (m) => m.id === selectedMunicipality
  );

  return (
    <div className="flex flex-col xl:flex-row size-full gap-5">
      <div className="xl:grow-1 shrink-0 xl:max-w-80 grid md:grid-cols-2 xl:flex flex-col gap-2">
        <div className="space-y-2 p-4 border border-dashed rounded-lg">
          <h3 className="text-sm font-medium flex items-center gap-1.5">
            <Flag className="size-3.5" />
            Municipio
          </h3>
          <Select
            value={selectedMunicipality}
            onValueChange={(value) => setSelectedMunicipality(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um municipio" />
            </SelectTrigger>
            <SelectContent>
              {municipalities.map((municipality) => (
                <SelectItem key={municipality.id} value={municipality.id}>
                  {municipality.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 p-4 border border-dashed rounded-lg">
          <h3 className="text-sm font-medium flex items-center gap-1.5">
            <Search className="size-3.5" />
            Pesquisa
          </h3>
          <Input
            placeholder="Nome do projeto"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
        </div>
        <div className="space-y-4 p-4 border border-dashed rounded-lg">
          <div className="gap-1 flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Building className="size-3.5" />
              Tipo de equipamento
            </h3>
            {filterCategories.length > 0 && (
              <Button
                size="inline"
                variant="underline"
                className="text-sm p-0 gap-1 items-center"
                onClick={() => {
                  setFilterCategories([]);
                }}
              >
                Limpar
              </Button>
            )}
          </div>
          <MultiSelect
            placeholder="Selecione os resultados"
            selectedLabel={
              "selecionado" + (filterCategories.length > 1 ? "s" : "")
            }
            options={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            value={filterCategories}
            onChange={(value) => setFilterCategories(value)}
            size="w-72"
          />
        </div>
        <MapFilterQuestions
          filterResearchs={filterResearchs}
          onChange={(filters) => {
            setFilterResearchs(filters);
          }}
        />
      </div>
      <div className="flex-1 grid aspect-square xl:aspect-auto xl:size-full relative">
        <div className="size-full transition-all rounded-2xl overflow-hidden relative isolate">
          <Map
            key={`${selectedMunicipality}-${locked}`}
            zoom={13}
            center={[municipality?.latitude ?? 0, municipality?.longitude ?? 0]}
            locked={locked}
            variant="colored"
          >
            {projects
              .filter((p) => {
                if (filterCategories.length === 0) return true;
                return filterCategories.includes(p.categoryId);
              })
              .filter((p) => {
                if (filterSearch.length === 0) return true;
                return p.name
                  .toLowerCase()
                  .includes(filterSearch.toLowerCase());
              })
              .filter((p) => {
                if (filterResearchs.length === 0) return true;

                for (const filter of filterResearchs) {
                  if (!filter.visible) continue;

                  const q = questions.find((q) => q.id === filter.questionId);
                  const r = researchsResults.researchs[filter.researchId];
                  const projectAnswer = r.results[p.id]?.[filter.questionId];

                  if (!projectAnswer) return false;

                  if (q?.type === "number") {
                    const min = parseFloat(filter.results[0]);
                    const max = parseFloat(filter.results[1]);
                    const projectAnswerNumber = parseFloat(
                      projectAnswer[0] ?? "0"
                    );

                    if (projectAnswerNumber < min || projectAnswerNumber > max)
                      return false;
                  } else {
                    for (let a of projectAnswer) {
                      if (!filter.results.includes(a)) return false;
                    }
                  }
                }

                return true;
              })
              .map((project) => (
                <MapMarker
                  key={project.id}
                  position={[project.latitude, project.longitude]}
                  onClick={() => setSelectedProject(project.id)}
                />
              ))}
          </Map>
        </div>

        <div className="z-10 absolute bottom-5 right-5 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocked(!locked)}
          >
            {locked ? <Lock /> : <Unlock />}
          </Button>
        </div>
      </div>
      <ProjectDialog
        id={selectedProject}
        onClose={() => setSelectedProject("")}
        viewLink={isPublic ? "/project/$id" : undefined}
      />
    </div>
  );
}

function MapFilterQuestions({
  filterResearchs,
  onChange,
}: {
  filterResearchs: {
    id: string;
    researchId: string;
    questionId: string;
    results: string[];
    visible: boolean;
  }[];
  onChange?: (
    filters: {
      id: string;
      researchId: string;
      questionId: string;
      results: string[];
      visible: boolean;
    }[]
  ) => void;
}) {
  const { data: questions } = useSuspenseQuery(getQuestionsListOptions());
  const { data: researchs } = useSuspenseQuery(getResearchsListOptions());
  const { data: researchsResults } = useSuspenseQuery(
    getResearchsResultsListOptions()
  );

  const [open, setOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  const questionDetails = questions.find((q) => q.id === selectedQuestion);

  return (
    <div className="space-y-4 p-4 border border-dashed rounded-lg">
      <div className="gap-1 flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <FilterIcon className="size-3.5" />
          Filtros
        </h3>
        {filterResearchs.length > 0 && (
          <Button
            variant="underline"
            size="inline"
            className="text-sm p-0 gap-1 items-center"
            onClick={() => {
              onChange?.([]);
            }}
          >
            Limpar
          </Button>
        )}
      </div>
      {filterResearchs.map((filter) => (
        <div key={filter.id} className="flex items-center gap-2">
          <div className="text-sm  px-2 py-1 rounded-md flex-1 truncate min-h-9 flex items-center border border-dashed">
            <div className="flex gap-1">
              <span className="text-xs">
                {researchs.find((r) => r.id === filter.researchId)?.name}
              </span>
              <span className="text-xs">
                {questions.find((q) => q.id === filter.questionId)?.question}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const filters = filterResearchs.map((f) =>
                f.id === filter.id ? { ...f, visible: !f.visible } : f
              );
              onChange?.(filters);
            }}
          >
            {filter.visible ? <EyeOff /> : <Eye />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const filters = filterResearchs.filter((f) => f.id !== filter.id);
              onChange?.(filters);
            }}
          >
            <Trash />
          </Button>
        </div>
      ))}
      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          setSelectedResearch("");
          setSelectedQuestion("");
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus />
            Adicionar filtro
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
            <DialogDescription>
              Filtre os projetos por dados de pesquisa.
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg p-6 border-dashed space-y-6">
            <div className="space-y-2">
              <Label>Pesquisa</Label>
              <Select
                value={selectedResearch}
                onValueChange={(value) => {
                  setSelectedResearch(value);
                  if (selectedResearch !== value) {
                    setSelectedQuestion("");
                    setSelectedResults([]);
                  }
                }}
              >
                <SelectTrigger className="w-96 max-w-full">
                  <SelectValue placeholder="Selecione uma area de pesquisa" />
                </SelectTrigger>
                <SelectContent>
                  {researchs.map((research) => (
                    <SelectItem key={research.id} value={research.id}>
                      {research.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedResearch && (
              <MapFilterQuestionsSelectQuestion
                value={selectedQuestion}
                onChange={(value) => {
                  setSelectedQuestion(value);
                  if (selectedQuestion !== value) {
                    setSelectedResults([]);
                  }
                }}
                questions={(() => {
                  const data = researchsResults.researchs[selectedResearch];
                  if (Object.values(data.results).length === 0) return [];

                  return Object.entries(data.questions).map(([key, value]) => ({
                    id: key,
                    label: value,
                    type: questions.find((q) => q.id === key)?.type ?? "",
                  }));
                })()}
              />
            )}

            {selectedQuestion && (
              <div className="space-y-4">
                <Label className="border-b pb-2">Resultados</Label>
                {questionDetails?.type === "select" && (
                  <MapFilterQuestionsSelectResults
                    value={selectedResults}
                    onChange={(value) => setSelectedResults(value)}
                    results={(() => {
                      const output: string[] = [];

                      const data = researchsResults.researchs[selectedResearch];
                      if (Object.values(data.results).length === 0) {
                        return output;
                      }

                      for (const [key, row] of Object.entries(data.results)) {
                        for (const [key, value] of Object.entries(row)) {
                          if (output.includes(value.join(","))) continue;
                          output.push(value.join(","));
                        }
                      }

                      return output;
                    })()}
                  />
                )}

                {questionDetails?.type === "number" && (
                  <MapFilterQuestionsNumberResults
                    value={selectedResults}
                    onChange={(value) => setSelectedResults(value)}
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              disabled={
                !selectedQuestion ||
                !selectedResearch ||
                !selectedResults.length
              }
              onClick={() => {
                onChange?.([
                  ...filterResearchs,
                  {
                    id: ulid(),
                    researchId: selectedResearch,
                    questionId: selectedQuestion,
                    results: selectedResults,
                    visible: true,
                  },
                ]);

                setOpen(false);
              }}
            >
              <Plus />
              Adicionar filtro
            </Button>
            <Button variant="outline">Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MapFilterQuestionsSelectQuestion({
  value,
  onChange,
  questions,
}: {
  value: string;
  onChange: (value: string) => void;
  questions: { id: string; type: string; label: string }[];
}) {
  if (!questions.length) {
    return (
      <div className="text-sm max-w-96 text-muted-foreground border p-2 border-dashed rounded-lg text-center">
        Sem resultados
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Area de pesquisa</Label>
      <Select value={value} onValueChange={(value) => onChange(value)}>
        <SelectTrigger className="w-96 max-w-full">
          <SelectValue placeholder="Selecione uma area de pesquisa" />
        </SelectTrigger>
        <SelectContent>
          {questions
            .filter((question) => {
              return ["select", "number"].includes(question.type);
            })
            .map((question) => (
              <SelectItem key={question.id} value={question.id}>
                {question.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MapFilterQuestionsSelectResults({
  value,
  onChange,
  results,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  results: string[];
}) {
  if (!results.length) {
    return (
      <div className="text-sm text-muted-foreground border p-2 border-dashed rounded-lg text-center">
        Sem resultados
      </div>
    );
  }

  return (
    <MultiSelect
      placeholder="Selecione os resultados"
      selectedLabel="opções selecionadas"
      options={results.map((result) => ({
        label: result,
        value: result,
      }))}
      value={value}
      onChange={onChange}
    />
  );
}

function MapFilterQuestionsNumberResults({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [min, setMin] = useState(value[0] ?? "");
  const [max, setMax] = useState(value[1] ?? "");

  return (
    <div className="flex gap-5">
      <div className="space-y-1 flex-1">
        <Label className="text-xs">Mínimo</Label>
        <Input
          type="number"
          placeholder="0"
          value={min}
          onChange={(e) => {
            setMin(e.target.value);
            onChange([e.target.value, max]);
          }}
        />
      </div>
      <div className="space-y-1 flex-1">
        <Label className="text-xs">Máximo</Label>
        <Input
          type="number"
          placeholder="0"
          value={max}
          onChange={(e) => {
            setMax(e.target.value);
            onChange([min, e.target.value]);
          }}
        />
      </div>
    </div>
  );
}
