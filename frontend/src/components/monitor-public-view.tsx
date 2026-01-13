import { useState } from "react";
import { Button } from "./ui/button";
import { Flag, Building } from "lucide-react";
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
import { ScrollArea } from "./ui/scroll-area";

export function MonitorPublicView() {
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
  const [selectedMunicipality, setSelectedMunicipality] = useState("all");

  const categoriesMap = new Map(categories.map((c) => [c.id, c]));
  const projectsMap = new Map(projects.map((p) => [p.id, p]));
  const question = questions.find((q) => q.id === questions[0]?.id);

  function getBooleanChartData(selectedQuestion: string) {
    const result: {
      name: string;
      data: { yes: number; no: number; noData: number }[];
    }[] = [];

    for (const [researchId, research] of Object.entries(
      researchsResults.researchs
    )) {
      if (filterResearchs.length && !filterResearchs.includes(researchId)) {
        continue;
      }

      const totalProjects = projects.filter(
        (p) =>
          p.municipalityId === research.research.municipalityId &&
          (selectedMunicipality === "all" ||
            selectedMunicipality === p.municipalityId)
      );

      let yesCount = 0;
      let noCount = 0;

      // iterate over ALL projects of this research
      for (const [projectId, project] of Object.entries(research.results)) {
        if (filterProjects.length && !filterProjects.includes(projectId))
          continue;

        const projectData = projectsMap.get(projectId);
        if (!projectData) continue;

        if (
          selectedMunicipality !== "all" &&
          projectData.municipalityId !== selectedMunicipality
        ) {
          continue;
        }

        const categoryData = categoriesMap.get(projectData.categoryId);
        if (!categoryData) continue;

        if (
          filterCategories.length &&
          !filterCategories.includes(categoryData.id)
        )
          continue;

        // Get answer for this question
        const answer = project[selectedQuestion]?.[0];

        if (answer === "true") yesCount++;
        else if (answer === "false") noCount++;
      }

      if (totalProjects.length > 0) {
        result.push({
          name:
            research.research.name ||
            format(research.research.createdAt, "dd/MM/yyyy"),
          data: [
            {
              yes: yesCount,
              no: noCount,
              noData: Math.max(0, totalProjects.length - yesCount - noCount),
            },
          ],
        });
      }
    }

    return result;
  }

  function getNumberChartData(selectedQuestion: string) {
    const data: {
      name: string;
      items: { name: string; total: number }[];
    }[] = [];

    for (const [researchId, research] of Object.entries(
      researchsResults.researchs
    )) {
      if (filterResearchs.length && !filterResearchs.includes(researchId)) {
        continue;
      }

      const researchEntry = {
        name: research.research.name,
        items: [] as { name: string; total: number }[],
      };

      for (const [projectId, project] of Object.entries(research.results)) {
        if (filterProjects.length && !filterProjects.includes(projectId)) {
          continue;
        }

        const projectData = projectsMap.get(projectId);
        if (!projectData) continue;

        if (
          selectedMunicipality !== "all" &&
          projectData.municipalityId !== selectedMunicipality
        ) {
          continue;
        }

        const rawValue = project[selectedQuestion]?.[0];
        if (!rawValue) continue;

        const value = Number(rawValue);
        if (Number.isNaN(value)) continue;

        researchEntry.items.push({
          name: projectData.name,
          total: value,
        });
      }

      if (researchEntry.items.length) {
        data.push(researchEntry);
      }
    }

    return data;
  }

  function getTextChartData(selectedQuestion: string) {
    const data: {
      name: string;
      items: { name: string; answer: string }[];
    }[] = [];

    for (const [researchId, research] of Object.entries(
      researchsResults.researchs
    )) {
      if (filterResearchs.length && !filterResearchs.includes(researchId)) {
        continue;
      }

      const researchEntry = {
        name: research.research.name,
        items: [] as { name: string; answer: string }[],
      };

      for (const [projectId, project] of Object.entries(research.results)) {
        if (filterProjects.length && !filterProjects.includes(projectId)) {
          continue;
        }

        const projectData = projectsMap.get(projectId);
        if (!projectData) continue;

        if (
          selectedMunicipality !== "all" &&
          projectData.municipalityId !== selectedMunicipality
        ) {
          continue;
        }

        const answer = project[selectedQuestion]?.[0];
        if (!answer) continue;

        researchEntry.items.push({
          name: projectData.name,
          answer,
        });
      }

      if (researchEntry.items.length) {
        data.push(researchEntry);
      }
    }

    return data;
  }

  function getChartData(selectedQuestion: string) {
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

          // const date = format(research.research.createdAt, "dd/MM/yyyy");
          const indexValue = research.research.name;

          const index = data.findIndex((d) => d.name === indexValue);

          if (index === -1) {
            data.push({
              name: indexValue,
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

    return data;
  }

  return (
    <div className="flex flex-col xl:flex-row  size-full items-start gap-5 relative">
      <div className="w-full grid sm:grid-cols-2 xl:flex flex-col gap-2 grow shrink-0 xl:max-w-80 xl:sticky top-10">
        <div className="space-y-2 p-4 border border-dashed rounded-lg min-w-48">
          <h3 className="text-sm font-medium flex items-center gap-1.5">
            <Flag className="size-3.5" />
            Zona
          </h3>
          <Select
            value={selectedMunicipality}
            onValueChange={(value) => {
              setSelectedMunicipality(value);
              setFilterCategories([]);
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
              Tipo de equipamento
            </h3>
            {filterCategories.length > 0 && (
              <Button
                size="inline"
                variant="underline"
                className="text-sm p-0 gap-1 items-center"
                onClick={() => {
                  setFilterCategories([]);
                  setFilterProjects([]);
                }}
              >
                Limpar
              </Button>
            )}
          </div>
          <MultiSelect
            placeholder="Selecione os tipos"
            selectedLabel={"tipo" + (filterCategories.length > 1 ? "s" : "")}
            options={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            value={filterCategories}
            onChange={(value) => {
              setFilterCategories(value);
              setFilterProjects([]);
            }}
            size="w-72"
          />
        </div>

        <div className="space-y-2 p-4 border border-dashed rounded-lg">
          <div className="gap-1 flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Building className="size-3.5" />
              Equipamentos
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
            placeholder="Selecione os equipamentos"
            selectedLabel={
              "equipamento" + (filterProjects.length > 1 ? "s" : "")
            }
            options={projects
              .filter((p) => {
                if (selectedMunicipality === "all") {
                  return true;
                }

                return selectedMunicipality === p.municipalityId;
              })
              .filter((p) => {
                if (!filterCategories.length) {
                  return true;
                }

                return filterCategories.includes(p.categoryId);
              })
              .map((project) => ({
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
      </div>
      <div className="w-full flex-1 space-y-10">
        {questions
          .sort((a, b) => {
            const getNumber = (q: string) => {
              const match = q.match(/^(\d+)\./);
              return match ? parseInt(match[1], 10) : Infinity;
            };

            return getNumber(a.question) - getNumber(b.question);
          })
          .filter((question) => question.isPublic)
          .map((question) => (
            <div className="transition-all rounded-2xl border border-dashed overflow-hidden relative isolate p-10 space-y-16">
              <div className="space-y-4">
                <div className="w-12 h-1.5 rounded-full bg-slate-200"></div>
                <h1 className="text-xl font-medium text-slate-900">
                  {question?.question}
                </h1>
              </div>

              {(() => {
                const data = getChartData(question.id);

                switch (question.type) {
                  case "text":
                    return <TextChart data={getTextChartData(question.id)} />;
                  case "number":
                    return (
                      <NumberChart data={getNumberChartData(question.id)} />
                    );
                  case "boolean":
                    return (
                      <BooleanChart data={getBooleanChartData(question.id)} />
                    );
                  default:
                    return <Chart data={data} />;
                }
              })()}

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
                      Equipamentos
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
          ))}
      </div>
    </div>
  );
}

const colors = [
  "#fef3c7", // amber-200
  "#dbeafe", // blue-100
  "#dcfce7", // green-100
  "#fee2e2", // red-100
  "#f3e8ff", // purple-100
  "#ffedd5", // orange-100
  "#fce7f3", // pink-100
  "#d6d3d1", // brown-100 (stone-100)
  "#f3f4f6", // gray-100
  "#f5f5f4", // replaced black-100 → neutral-100
  "#f1f5f9", // replaced white-100 → slate-100
  "#fef9c3", // yellow-100
  "#ecfccb", // lime-100
  "#ccfbf1", // teal-100
  "#cffafe", // cyan-100
  "#e0e7ff", // indigo-100
  "#ede9fe", // violet-100
  "#ffe4e6", // rose-100
  "#e0f2fe", // sky-100
  "#fde68a", // amber-100
  "#dbeafe", // blue-100
  "#dcfce7", // green-100
  "#fee2e2", // red-100
  "#f3e8ff", // purple-100
  "#ffedd5", // orange-100
  "#fce7f3", // pink-100
  "#d6d3d1", // brown-100 (stone-100)
  "#f3f4f6", // gray-100
  "#f5f5f4", // neutra l-100
  "#f1f5f9", // slate-100
  "#fef9c3", // yellow-100
  "#ecfccb", // lime-100
  "#ccfbf1", // teal-100
  "#cffafe", // cyan-100
  "#e0e7ff", // in
];

function TextChart({
  data,
}: {
  data: { name: string; items: { name: string; answer: string }[] }[];
}) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center aspect-16/7 w-full border border-dashed rounded-lg">
        <p className="text-sm font-medium text-slate-500">Sem resultados</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      <div className="flex flex-col gap-6">
        {data.map((research) => (
          <div key={research.name} className="space-y-4">
            {/* Research name */}
            <h3 className="text-sm font-medium text-slate-500">
              {research.name}
            </h3>

            {/* Projects */}
            <div className="space-y-3">
              {research.items.map((item) => (
                <div
                  key={item.name}
                  className="border border-dashed rounded-lg p-4"
                >
                  <h4 className="text-sm font-medium text-slate-600">
                    {item.name}
                  </h4>
                  <p className="text-base text-slate-900">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function NumberChart({
  data,
}: {
  data: {
    name: string;
    items: { name: string; total: number }[];
  }[];
}) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center aspect-16/7 w-full border border-dashed rounded-lg">
        <p className="text-sm font-medium text-slate-500">Sem resultados</p>
      </div>
    );
  }

  // Aggregate total per research
  const chartData = data.map((research) => ({
    name: research.name,
    value: research.items.reduce((sum, item) => sum + item.total, 0),
  }));

  return (
    <div className="aspect-16/6 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid stroke="var(--color-blue-100)" strokeDasharray="3 3" />

          <XAxis
            dataKey="name"
            // interval={0}
            tick={
              chartData.length <= 6
                ? {
                    fill: "var(--color-blue-900)",
                    fontSize: 12,
                    fontWeight: 500,
                  }
                : false
            }
            axisLine={{ stroke: "var(--color-blue-100)" }}
            tickLine={false}
            // tickFormatter={(value) => truncate(value)}
          />

          <YAxis
            tick={{ fill: "var(--color-blue-900)", fontSize: 12 }}
            axisLine={{ stroke: "var(--color-blue-100)" }}
            tickLine={false}
          />

          <Tooltip
            content={CustomNumberTooltip}
            formatter={(value) => value}
            labelFormatter={(label) => label}
          />

          <Bar dataKey="value" fill={colors[0]} maxBarSize={64}>
            <LabelList dataKey="value" content={renderCustomLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BooleanChart({
  data,
}: {
  data: { name: string; data: { yes: number; no: number; noData: number }[] }[];
}) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center aspect-16/7 w-full border border-dashed rounded-lg">
        <p className="text-sm font-medium text-slate-500">Sem resultados</p>
      </div>
    );
  }

  // Flatten for Recharts: each research becomes { name, yes, no, noData }
  const chartData = data.map((research) => ({
    name: research.name,
    yes: research.data[0]?.yes ?? 0,
    no: research.data[0]?.no ?? 0,
    noData: research.data[0]?.noData ?? 0,
  }));

  const columns: Array<keyof typeof columnLabels> = ["no", "yes", "noData"];
  const columnLabels = {
    no: "Nāo",
    yes: "Sim",
    noData: "Projetos sem dados",
  };

  return (
    <div className="aspect-16/6 w-full">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        {columns.map((key, i) => (
          <div
            key={key}
            className="flex items-center gap-3 border border-dashed border-blue-100 py-1.5 px-3 rounded-md"
          >
            <div
              className="size-4 shrink-0 rounded-[2px]"
              style={{ backgroundColor: colors[i] }}
            />
            <span className="text-xs font-medium">{columnLabels[key]}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="var(--color-blue-100)" strokeDasharray="3 3" />

          <XAxis
            dataKey="name"
            interval={0}
            tick={
              chartData.length <= 6
                ? {
                    fill: "var(--color-blue-900)",
                    fontSize: 12,
                    fontWeight: 500,
                  }
                : false
            }
            axisLine={{ stroke: "var(--color-blue-100)" }}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "var(--color-blue-900)", fontSize: 12 }}
            axisLine={{ stroke: "var(--color-blue-100)" }}
            tickLine={false}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload) return null;
              return (
                <div className="bg-background border border-border rounded-lg p-2 max-w-96 text-sm font-medium">
                  <div className="space-y-1">
                    {payload.map((p: any, i: number) => {
                      // Only use keys that exist in columnLabels
                      const key = p.name as keyof typeof columnLabels;
                      return (
                        <div key={i} className="flex items-center gap-1.5 px-2">
                          <div
                            className="size-4 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: colors[i] }}
                          />
                          <span className="text-sm font-medium flex-1 truncate">
                            {columnLabels[key] ?? p.name}
                          </span>
                          <span className="text-sm font-medium min-w-8 text-right">
                            {p.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 truncate">
                    {label}
                  </div>
                </div>
              );
            }}
          />

          {columns.map((key, i) => (
            <Bar
              key={key}
              stackId="a"
              dataKey={key}
              fill={colors[i]}
              maxBarSize={64}
            >
              <LabelList dataKey={key} content={renderCustomLabel} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Chart({ data }: { data: { [key: string]: number | string }[] }) {
  const [type, setType] = useState<"total" | "percentage">("total");

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center aspect-16/7 w-full border border-dashed rounded-lg &_**:focus:outline-none">
        <p className="text-sm font-medium text-slate-500">Sem resultados</p>
      </div>
    );
  }

  const columns = Object.keys(data[0]).filter((key) => key !== "name");

  const totals: Record<string, number> = {};

  for (const row of data) {
    const rowName = row.name;

    if (!totals[rowName]) {
      totals[rowName] = 0;
    }

    for (const key of columns) {
      const value = row[key];

      if (typeof value !== "number" || !Number.isFinite(value)) {
        continue;
      }

      totals[rowName] += value;
    }
  }

  const values: { [key: string]: number | string }[] = [];

  for (const row of data) {
    const total = totals[row.name] ?? 0;

    const newRow: { [key: string]: number | string } = {
      name: row.name,
    };

    for (const [key, val] of Object.entries(row)) {
      if (typeof val === "string") {
        newRow[key] = val;
        continue;
      }

      if (typeof val !== "number" || !Number.isFinite(val)) {
        newRow[key] = 0;
        continue;
      }

      if (type === "total") {
        newRow[key] = val;
        continue;
      }

      // prevent divide-by-zero
      if (total === 0) {
        newRow[key] = "0.0";
        continue;
      }

      newRow[key] = ((val * 100) / total).toFixed(1);
    }

    values.push(newRow);
  }

  return (
    <div>
      <div className="flex flex-col gap-5 mb-5">
        <div className="flex flex-wrap items-center gap-2.5">
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
                <span className="text-xs font-medium">{key}</span>
              </div>
            );
          })}
        </div>
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
              tick={
                data.length <= 6
                  ? {
                      fill: "var(--color-blue-900)",
                      fontSize: 12,
                      fontWeight: 500,
                    }
                  : false
              }
              axisLine={{ stroke: "var(--color-blue-100)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-blue-900)", fontSize: 12 }}
              axisLine={{ stroke: "var(--color-blue-100)" }}
              tickLine={false}
            />

            <Tooltip
              content={CustomTooltip}
              labelFormatter={(label) => label}
            />

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

const CustomNumberTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any;
  label?: string | number;
}) => {
  if (!active || !payload || !payload.length) return null;

  // Only one bar per research
  const dataPoint = payload[0];

  return (
    <div className="bg-background border border-border rounded-lg p-2 max-w-96 text-sm font-medium">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 px-2">
          <div
            className="size-4 shrink-0 rounded-[2px]"
            style={{ backgroundColor: colors[0] }}
          />
          <span className="text-sm font-medium flex-1 truncate">
            {label} {/* Research name */}
          </span>
          <span className="text-sm font-medium min-w-8 text-right">
            {dataPoint.value}
          </span>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active: boolean;
  payload: any;
  label?: string | number;
}) => {
  const isVisible = active && payload && payload.length;

  const stacks = payload?.filter((p: any) => p.name !== "name");

  return (
    <div
      className="bg-background border border-border rounded-lg p-2 max-w-96 text-sm font-medium"
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
              <span className="text-sm font-medium flex-1 truncate">
                {stack.name}
              </span>
              <span className="text-sm font-medium min-w-8 text-right">
                {stack.value}
              </span>
            </div>
          ))}
          <div className="px-2">
            <span className="text-xs text-slate-500 truncate">{label}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const renderCustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  const fontSize = 12;

  if (width < 30 || height < 15) {
    return null; // skip label if the segment is too small
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
