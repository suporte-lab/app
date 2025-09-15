import { useQuery } from "@tanstack/react-query";
import { getProjectOptions } from "@/server/services/project/options";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useEffect, useState } from "react";
import { Eye, Mail, Phone, User } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { ResearchProjectCharts } from "../research/research-project-charts";
import { ScrollArea } from "../ui/scroll-area";

export function ProjectDialog({
  id,
  open,
  onOpenChange,
  onClose,
  viewLink,
}: {
  id: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  viewLink?: string;
}) {
  const { data } = useQuery(getProjectOptions({ id }));

  const [internalOpen, setInternalOpen] = useState(open ?? false);

  useEffect(() => {
    setInternalOpen(true);
  }, [id]);

  function handleChange(open: boolean) {
    setInternalOpen(open);
    onOpenChange?.(open);

    if (!open) {
      onClose?.();
    }
  }

  if (!data) return null;

  return (
    <Dialog open={open ?? internalOpen} onOpenChange={handleChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{data.name}</DialogTitle>
          <DialogDescription>
            {data.addressStreet}, {data.addressZipCode}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <ResearchProjectCharts projectId={data.id} />
        </ScrollArea>

        <DialogFooter className="flex justify-start">
          <Button size="sm" asChild>
            <Link to={viewLink ?? "/dashboard/project/$id"} params={{ id }}>
              <Eye /> Visualizar projeto
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
