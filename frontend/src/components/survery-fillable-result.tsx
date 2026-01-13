import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fetchResearchOptions } from "@/lib/api";
import { ScrollArea } from "./ui/scroll-area";

export function SurveyFillableResult({
  projectId,
  researchId,
  onBack,
}: {
  projectId: string;
  researchId: string;
  onBack?: () => void;
}) {
  const { data } = useQuery(fetchResearchOptions(researchId));

  if (!data) {
    return <Skeleton className="aspect-4/3 w-full max-w-lg" />;
  }

  const responseDateRaw = data.results[projectId]?.createdAt.join("");
  const responseDate = responseDateRaw
    ? format(responseDateRaw, "dd-MM-yyyy HH:mm")
    : "-";

  return (
    <Card className="p-8 pb-10 max-w-lg w-full">
      <div className="flex flex-col gap-2 justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">Data de envio</p>
          <div className="text-sm font-medium text-right">{responseDate}</div>
        </div>

        <h2 className="text-2xl font-bold">{data.research.name}</h2>

        <div className="w-8 h-1 bg-foreground/10 rounded-full"></div>
      </div>

      <ScrollArea className="max-h-[60vh]">
        <div className="space-y-6">
          {Object.entries(data.questions).map(([questionId, question]) => (
            <div key={questionId}>
              <div className="text-sm font-medium mb-1">{question}</div>
              <div className="text-sm text-muted-foreground min-h-5">
                {data.results[projectId]?.[questionId]?.join(", ")}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          onBack?.();
        }}
      >
        Back
      </Button>

      <div className="text-sm text-muted-foreground text-center">
        All data is treated by @CincoBasico
      </div>
    </Card>
  );
}
