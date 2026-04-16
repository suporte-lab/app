import { getProjectsListOptions } from "@/server/services/project/options";
import { MapBanner } from "../map-banner";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { MapMarker } from "../map-marker";
import { getMunicipalityOptions } from "@/server/services/municipality/options";
import { ProjectDialog } from "../project/project-dialog";
import { useState } from "react";

export function MunicipalityMapBanner({
  id,
  categoryId,
}: {
  id: string;
  categoryId?: string;
}) {
  const { data: municipality } = useQuery(getMunicipalityOptions({ id }));
  const { data: projects } = useQuery(
    getProjectsListOptions({ municipalityId: id, categoryId })
  );

  const [selectedProject, setSelectedProject] = useState<string>("");

  if (!municipality || !projects) {
    return <Skeleton className="aspect-video w-full" />;
  }

  return (
    <>
      <MapBanner center={[municipality.latitude, municipality.longitude]}>
        {projects.map((project) => (
          <MapMarker
            key={project.id}
            position={[project.latitude, project.longitude]}
            onClick={() => setSelectedProject(project.id)}
          />
        ))}
      </MapBanner>

      <ProjectDialog id={selectedProject} />
    </>
  );
}
