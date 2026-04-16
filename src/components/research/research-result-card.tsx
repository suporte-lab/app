import { getResearchOptions } from "@/server/services/research/options";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { LinkIcon, Mail } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import {
  getProjectCategoryOptions,
  getProjectOptions,
} from "@/server/services/project/options";
import { getMunicipalityOptions } from "@/server/services/municipality/options";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

export function ResearchResultCard({
  researchId,
  projectId,
}: {
  researchId: string;
  projectId: string;
}) {
  const { data: research } = useQuery(getResearchOptions({ id: researchId }));

  const { data: project } = useQuery(getProjectOptions({ id: projectId }));
  const { data: municipality } = useQuery(
    getMunicipalityOptions({ id: project?.municipalityId ?? "" })
  );
  const { data: category } = useQuery(
    getProjectCategoryOptions({ id: project?.categoryId ?? "" })
  );

  if (!research || !project || !category || !municipality) {
    return <Skeleton className="aspect-video w-full max-w-lg" />;
  }

  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-6">
        <div>
          <h3 className="font-medium">{project.name}</h3>
          <div className="flex gap-1 mt-2">
            <Badge variant="outline">{municipality.name}</Badge>
            <Badge variant="outline">{category.name}</Badge>
            <Badge variant="warning">Pending</Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" asChild>
            <Link to="/dashboard/research/$id" params={{ id: researchId }}>
              <Mail />
              Send notification
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/dashboard/research/${research.slug}/${project.id}`
              );
              toast.success("Link copied to clipboard");
            }}
          >
            <LinkIcon />
            Copy link
          </Button>
        </div>
      </div>
    </div>
  );
}
