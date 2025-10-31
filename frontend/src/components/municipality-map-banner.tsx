import { MapBanner } from "./map-banner";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { MapMarker } from "./map-marker";
import { ProjectDialog } from "./project-dialog";
import { useState } from "react";
import { fetchMunicipalityOptions, fetchProjectsOptions } from "@/lib/api";

export function MunicipalityMapBanner({
  id,
  categoryId,
}: {
  id: string;
  categoryId?: string;
}) {
  const { data: municipality } = useQuery(fetchMunicipalityOptions(id));
  const { data: projects } = useQuery(fetchProjectsOptions());

  const [selectedProject, setSelectedProject] = useState<string>("");

  if (!municipality || !projects) {
    return <Skeleton className="aspect-video w-full" />;
  }

  let list = projects;

  if (categoryId) {
    list = projects.filter((p) => p.categoryId === categoryId);
  }

  return (
    <>
      <MapBanner center={[municipality.latitude, municipality.longitude]}>
        {list.map((project) => (
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
