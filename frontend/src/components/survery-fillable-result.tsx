import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fetchResearchOptions } from "@/lib/api";

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

  return (
    <Card className="p-8 pb-10 max-w-lg w-full">
      <div className="flex gap-2 justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{data.research.name}</h2>
          <div className="w-8 h-1 bg-foreground/10 rounded-full"></div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Submitted on</p>
          <div className="text-sm font-medium text-right">
            {format(data.research.createdAt, "dd-MM-yyyy")}
          </div>
        </div>
      </div>

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
