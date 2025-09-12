import { Button } from "./ui/button";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { useState } from "react";

export function ConfirmDialog({
  children,
  onConfirm,
  open,
  onOpenChange,
  title,
  description,
}: {
  children?: React.ReactNode;
  onConfirm: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
}) {
  const [openInternal, setOpenInternal] = useState(open ?? false);

  return (
    <Dialog
      open={open ?? openInternal}
      onOpenChange={(open) => {
        setOpenInternal(open);
        onOpenChange?.(open);
      }}
    >
      {children && (
        <DialogTrigger asChild>
          <span>{children}</span>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? "Are you sure?"}</DialogTitle>
          <DialogDescription>
            {description ?? "This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              onConfirm();
              setOpenInternal(false);
              onOpenChange?.(false);
            }}
          >
            Delete
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
