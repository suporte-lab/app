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
        <div className="p-5 border rounded-md border-dashed flex gap-5">
          <div className="bg-muted size-12 p-3 flex items-center justify-center rounded-md mb-4">
            <User className="size-full" />
          </div>
          <div>
            <div className="text-sm font-medium mb-0.5">
              {data.responsibleRole}
            </div>
            <div className="text-lg truncate">
              <p>{data.responsibleName}</p>
            </div>

            <div className="flex gap-2 mt-3">
              {data.responsibleEmail?.length > 1 && (
                <Badge variant="outline">
                  <Mail className="size-4" />
                  <p>{data.responsibleEmail}</p>
                </Badge>
              )}

              {data.responsiblePhone && (
                <Badge variant="outline">
                  <Phone />
                  <p>{data.responsiblePhone}</p>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-start">
          <Button size="sm" asChild>
            <Link to={viewLink ?? "/dashboard/project/$id"} params={{ id }}>
              <Eye /> View project
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
