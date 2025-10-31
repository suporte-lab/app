import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Flag, Building, FileTextIcon } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { MultiSelect } from "./ui/multi-select";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "./ui/badge";
import {
  fetchCategoriesOptions,
  fetchMunicipalitiesOptions,
  fetchProjectsOptions,
  fetchResearchsOptions,
  fetchResearchsResultsOptions,
  fetchSurveysQuestionsOptions,
} from "@/lib/api";

export function MonitorSearch() {
  const { data: municipalities } = useSuspenseQuery(
    fetchMunicipalitiesOptions()
  );
  const { data: researchs } = useSuspenseQuery(fetchResearchsOptions());
  const { data: projects } = useSuspenseQuery(fetchProjectsOptions());
  const { data: categories } = useSuspenseQuery(fetchCategoriesOptions());
  const { data: questions } = useSuspenseQuery(fetchSurveysQuestionsOptions());
  const { data: researchsResults } = useSuspenseQuery(
    fetchResearchsResultsOptions()
  );

  const [filterResearchs, setFilterResearchs] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterProjects, setFilterProjects] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>(
    questions[0]?.id ?? ""
  );
  const [selectedMunicipality, setSelectedMunicipality] = useState("all");

  const categoriesMap = new Map(categories.map((c) => [c.id, c]));
  const projectsMap = new Map(projects.map((p) => [p.id, p]));

  const [chartData, setChartData] = useState<
    { name: string; [key: string]: number | string }[]
  >([]);

  const question = questions.find((q) => q.id === selectedQuestion);

  function getChartData() {
    const data: { name: string; [key: string]: number | string }[] = [];

    for (const [researchId, research] of Object.entries(
      researchsResults.researchs
    )) {
      if (!!filterResearchs.length && !filterResearchs.includes(researchId)) {
        continue;
      }

      for (const [projectId, project] of Object.entries(research.results)) {
        if (!!filterProjects.length && !filterProjects.includes(projectId)) {
          continue;
        }

        const projectData = projectsMap.get(projectId);
        if (!projectData) continue;

        const categoryData = categoriesMap.get(projectData?.categoryId);
        if (!categoryData) continue;

        if (
          selectedMunicipality !== "all" &&
          projectData.municipalityId !== selectedMunicipality
        ) {
          continue;
        }

        if (
          !!filterCategories.length &&
          !filterCategories.includes(categoryData.id)
        ) {
          continue;
        }

        for (const [questionId, answer] of Object.entries(project)) {
          if (!question || questionId !== selectedQuestion) continue;

          const date = format(research.research.createdAt, "dd/MM/yyyy");

          const index = data.findIndex((d) => d.name === date);

          if (question.type === "number") {
            const value = parseFloat(answer?.[0] ?? "0");

            if (index === -1) {
              data.push({
                name: date,
                [categoryData.name]: value,
              });
            } else {
              const currentValue = parseFloat(
                (data[index][categoryData.name] as string) ?? "0"
              );

              data[index][categoryData.name] = value + currentValue;
            }
          } else {
            if (index === -1) {
              data.push({
                name: date,
                [answer[0]]: 1,
              });
            } else {
              const currentValue = parseFloat(
                (data[index][answer[0]] as string) ?? "0"
              );

              data[index][answer[0]] = currentValue + 1;
            }
          }
        }
      }
    }

    setChartData(data);
  }

  useEffect(() => {
    getChartData();
  }, [
    selectedMunicipality,
    selectedQuestion,
    filterProjects,
    filterResearchs,
    filterCategories,
  ]);

  return (
    <div className="flex  size-full gap-5">
      <div className="flex flex-col gap-2 grow shrink-0 max-w-80">
        <div className="space-y-2 p-4 border border-dashed rounded-lg min-w-48">
          <h3 className="text-sm font-medium flex items-center gap-1.5">
            <Flag className="size-3.5" />
            Zona
          </h3>
          <Select
            value={selectedMunicipality}
            onValueChange={(value) => {
              setSelectedMunicipality(value);

              setFilterProjects([]);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um municipio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">BRASIL</SelectItem>
              {municipalities.map((municipality) => (
                <SelectItem key={municipality.id} value={municipality.id}>
                  {municipality.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 p-4 border border-dashed rounded-lg">
          <div className="gap-1 flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Building className="size-3.5" />
              Projetos
            </h3>
            {filterProjects.length > 0 && (
              <Button
                size="inline"
                variant="underline"
                className="text-sm p-0 gap-1 items-center"
                onClick={() => {
                  setFilterProjects([]);
                }}
              >
                Limpar
              </Button>
            )}
          </div>
          <MultiSelect
            placeholder="Selecione os projetos"
            selectedLabel={"projeto" + (filterProjects.length > 1 ? "s" : "")}
            options={projects.map((project) => ({
              label: project.name,
              value: project.id,
            }))}
            value={filterProjects}
            onChange={(value) => setFilterProjects(value)}
            size="w-72"
          />
        </div>

        <div className="space-y-2 p-4 border border-dashed rounded-lg">
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
            placeholder="Selecione os equipamentos"
            selectedLabel={
              "equipamento" + (filterCategories.length > 1 ? "s" : "")
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
        <div className="space-y-2 p-4 border border-dashed rounded-lg">
          <div className="gap-1 flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Flag className="size-3.5" />
              Pesquisa
            </h3>
            {filterResearchs.length > 0 && (
              <Button
                size="inline"
                variant="underline"
                className="text-sm p-0 gap-1 items-center"
                onClick={() => {
                  setFilterResearchs([]);
                }}
              >
                Limpar
              </Button>
            )}
          </div>
          <MultiSelect
            placeholder="Selecione as pesquisas"
            selectedLabel="pesquisas"
            options={researchs.map((research) => ({
              label: research.name,
              value: research.id,
            }))}
            value={filterResearchs}
            onChange={(value) => setFilterResearchs(value)}
            size="w-72"
          />
        </div>
        <div className="space-y-2 p-4 border border-dashed rounded-lg">
          <h3 className="text-sm font-medium flex items-center gap-1.5">
            <FileTextIcon className="size-3.5" />
            Pergunta
          </h3>
          <Select
            value={selectedQuestion}
            onValueChange={(value) => setSelectedQuestion(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma pergunta" />
            </SelectTrigger>
            <SelectContent>
              {questions
                .filter((question) =>
                  ["select", "number"].includes(question.type)
                )
                .map((question) => (
                  <SelectItem key={question.id} value={question.id}>
                    {question.question}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="size-full transition-all rounded-2xl border border-dashed overflow-hidden relative isolate p-10 space-y-16">
        <div className="space-y-4">
          <div className="w-12 h-1.5 rounded-full bg-slate-200"></div>
          <h1 className="text-xl font-medium text-slate-900">
            {question?.question}
          </h1>
        </div>
        <Chart data={chartData} />
        <div className="space-y-4">
          {filterResearchs.length > 0 && (
            <div className="border border-dashed rounded-lg p-4 flex gap-4">
              <h3 className="font-medium py-3 min-w-20 text-slate-600">
                Pesquisas
              </h3>
              <div className="flex items-center gap-2.5 border-l py-3 px-4">
                {filterResearchs.map((research) => (
                  <Badge
                    key={research}
                    variant="outline"
                    className="text-sm font-medium"
                  >
                    {researchs.find((r) => r.id === research)?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {filterCategories.length > 0 && (
            <div className="border border-dashed rounded-lg p-4 flex gap-4">
              <h3 className="font-medium py-3 min-w-20 text-slate-600">
                Categorias
              </h3>
              <div className="flex items-center gap-2.5 border-l py-3 px-4">
                {filterCategories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="text-sm font-medium"
                  >
                    {categoriesMap.get(category)?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {filterProjects.length > 0 && (
            <div className="border border-dashed rounded-lg p-4 flex gap-4">
              <h3 className="font-medium py-3 min-w-20 text-slate-600">
                Projetos{" "}
              </h3>
              <div className="flex items-center gap-2.5 border-l py-3 px-4">
                {filterProjects.map((project) => (
                  <Badge
                    key={project}
                    variant="outline"
                    className="text-sm font-medium"
                  >
                    {projectsMap.get(project)?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const colors = ["var(--color-amber-200)", "var(--color-blue-100)"];

function Chart({ data }: { data: { [key: string]: number | string }[] }) {
  const [type, setType] = useState<"total" | "percentage">("total");

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center aspect-16/7 w-full border border-dashed rounded-lg **:focus:outline-none">
        <p className="text-sm font-medium text-slate-500">Sem resultados</p>
      </div>
    );
  }

  const columns = Object.keys(data[0]).filter((key) => key !== "name");

  const totals: Record<string, number> = {};
  for (const row of data) {
    for (const key of columns) {
      if (typeof row[key] === "string") continue;

      if (!totals[row.name]) {
        totals[row.name] = row[key];
        continue;
      }

      totals[row.name] = (totals[row.name] || 0) + row[key];
    }
  }

  console.log(totals);

  const values: { [key: string]: number | string }[] = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const newRow: { [key: string]: number | string } = { name: row.name };

    for (const [key, val] of Object.entries(row)) {
      if (typeof val === "string") {
        newRow[key] = val;
        continue;
      }

      if (type == "total") {
        newRow[key] = val;
        continue;
      }

      console.log(val, totals[row.name]);

      newRow[key] = ((val * 100) / totals[row.name]).toFixed(1);
    }
    values.push(newRow);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant={type === "total" ? "outline" : "ghost"}
            onClick={() => setType("total")}
          >
            Total
          </Button>
          <Button
            size="sm"
            variant={type === "percentage" ? "outline" : "ghost"}
            onClick={() => setType("percentage")}
          >
            Percentagem
          </Button>
        </div>
        <div className="flex items-center gap-2.5 justify-end">
          {columns.map((key, i) => {
            return (
              <div
                key={key + i}
                className="flex items-center gap-3 border border-dashed border-blue-100 py-1.5 px-3 rounded-md"
              >
                <div
                  className="size-4 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: colors[i] }}
                />
                <span className="text-sm font-medium">{key}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="aspect-16/6 w-full **:focus:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={values}
            margin={{ top: 16, right: 0, left: 0, bottom: 0 }}
          >
            {/* light muted grid */}
            <CartesianGrid
              stroke="var(--color-blue-100)"
              strokeDasharray="3 3"
            />

            {/* clean axis with muted labels */}
            <XAxis
              dataKey="name"
              tick={{
                fill: "var(--color-blue-900)",
                fontSize: 12,
                fontWeight: 500,
              }}
              axisLine={{ stroke: "var(--color-blue-100)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-blue-900)", fontSize: 12 }}
              axisLine={{ stroke: "var(--color-blue-100)" }}
              tickLine={false}
            />

            <Tooltip content={CustomTooltip} />

            {columns.map((key, i) => {
              return (
                <Bar
                  key={key + i}
                  stackId={"a"}
                  dataKey={key}
                  fill={colors[i]}
                  maxBarSize={64}
                >
                  <LabelList dataKey={key} content={renderCustomLabel} />
                </Bar>
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active: boolean;
  payload: any;
}) => {
  const isVisible = active && payload && payload.length;

  const stacks = payload?.filter((p: any) => p.name !== "name");

  return (
    <div
      className="bg-background border border-border rounded-lg p-2 max-w-48 text-sm font-medium"
      style={{ visibility: isVisible ? "visible" : "hidden" }}
    >
      {isVisible && (
        <div className="space-y-1">
          {stacks.map((stack: any, i: number) => (
            <div key={stack + i} className="flex items-center gap-1.5 px-2">
              <div
                className="size-4 shrink-0 rounded-[2px]"
                style={{ backgroundColor: colors[i] }}
              />
              <span className="text-sm font-medium w-12 truncate">
                {stack.name}
              </span>
              <div className="h-4 w-1px bg-blue-100 rounded-full mx-1"></div>
              <span className="text-sm font-medium">{stack.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const renderCustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  const fontSize = 12;

  if (width < 30 || height < 15) {
    return null;
  }

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="var(--color-blue-900)"
      fontSize={fontSize}
      fontWeight={700}
    >
      {value}
    </text>
  );
};
