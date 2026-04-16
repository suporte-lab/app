import { getProjectOptions } from "@/server/services/project/options";
import { MapBanner } from "../map-banner";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { MapMarker } from "../map-marker";

export function ProjectMapBanner({ id }: { id: string }) {
  const { data: project } = useQuery(getProjectOptions({ id }));

  if (!project) {
    return <Skeleton className="aspect-video w-full" />;
  }

  return (
    <MapBanner center={[project.latitude, project.longitude]}>
      <MapMarker
        key={project.id}
        position={[project.latitude, project.longitude]}
      />
    </MapBanner>
  );
}
