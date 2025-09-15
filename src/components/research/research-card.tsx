import { getResearchOptions } from "@/server/services/research/options";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { Clipboard } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

export function ResearchCard({ id }: { id: string }) {
  const { data: research } = useQuery(getResearchOptions({ id }));

  if (!research) {
    return <Skeleton className="aspect-video w-full max-w-lg" />;
  }

  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{research.name}</h3>
            <p className="text-sm text-muted-foreground font-medium">
              /{research.slug}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link to="/dashboard/research/$id" params={{ id }}>
              See info
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to="/dashboard/survey/$id" params={{ id: research.surveyId }}>
              <Clipboard />
              Go to form
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
