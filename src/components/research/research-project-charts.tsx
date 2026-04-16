import {
  getResearchResultsByProjectIdOptions,
  getResearchsListOptions,
} from "@/server/services/research/options";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChartLine } from "../charts/chart-line";
import { ChartBar } from "../charts/chart-bar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "../ui/select";
import { SelectItem } from "../ui/select";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ResearchProjectCharts({ projectId }: { projectId: string }) {
  const [selectedQuestion, setSelectedQuestion] = useState("");

  const { data } = useQuery(
    getResearchResultsByProjectIdOptions({ id: projectId })
  );

  useEffect(() => {
    if (!data) return;

    setSelectedQuestion(
      Object.keys(data?.questions).find((questionId) => {
        return Object.keys(data.results).includes(questionId);
      }) ?? ""
    );
  }, [data]);

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="p-4 border border-dashed rounded-lg">
        <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
          <SelectTrigger className="w-full font-medium">
            <SelectValue placeholder="Select a survey" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(data.questions)
              .filter(([questionId]) => {
                return Object.keys(data.results).includes(questionId);
              })
              .map(([questionId]) => (
                <SelectItem key={questionId} value={questionId}>
                  {data.questions[questionId].question}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        {Object.entries(data.results).map(([questionId, researchs]) => {
          const question = data.questions[questionId];

          return (
            <Card
              key={questionId}
              className={cn("p-8", selectedQuestion !== questionId && "hidden")}
            >
              <div className="space-y-4">
                <h2 className="font-medium text-balance text-lg">
                  {question.question}
                </h2>
                <div className="w-8 h-1 rounded-full bg-slate-200"></div>
              </div>

              {question.type === "number" && (
                <NumberChart researchs={data.researchs} results={researchs} />
              )}
              {question.type === "text" && (
                <ListChart researchs={data.researchs} results={researchs} />
              )}
              {question.type === "select" && (
                <ListChart researchs={data.researchs} results={researchs} />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ListChart({
  researchs,
  results,
}: {
  researchs: Record<string, { name: string; createdAt: Date }>;
  results: Record<string, string[]>;
}) {
  return (
    <div className="space-y-6">
      {Object.keys(results).map((key) => {
        const research = results[key];
        return (
          <div key={key}>
            <div className="flex items-center gap-6 mb-2">
              <div className="flex-1 h-0.5 rounded-full bg-slate-100"></div>

              <div className="text-xs font-medium text-muted-foreground">
                {format(researchs[key].createdAt, "dd/MM/yyyy")}
              </div>
            </div>

            <div className="font-medium">{research[0]}</div>
          </div>
        );
      })}
    </div>
  );
}

function NumberChart({
  researchs,
  results,
}: {
  researchs: Record<string, { name: string; createdAt: Date }>;
  results: Record<string, string[]>;
}) {
  const chartData = Object.keys(results).map((key) => {
    const research = results[key];
    const date = format(researchs[key].createdAt, "MMM yyyy");
    return { name: date, value: parseInt(research[0]) };
  });

  const latestResearch = researchs[Object.keys(researchs)[0]];

  return (
    <div>
      <div className="flex gap-2 mb-10">
        <div className="flex items-end gap-3 border border-dashed border-slate-200 rounded-md py-3 pl-4 pr-6">
          <div className="text-4xl font-bold">
            {chartData[chartData.length - 1].value}
          </div>
          <div>
            <div className="text-xs font-medium">Latest</div>
            <div className="text-xs font-medium">
              {format(latestResearch.createdAt, "dd/MM/yyyy")}
            </div>
          </div>
        </div>
      </div>

      <ChartBar data={chartData} />
    </div>
  );
}
