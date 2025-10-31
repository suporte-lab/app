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
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>{title ?? "Tem a certeza?"}</DialogTitle>
            <DialogDescription>
              {description ?? "Esta ação não pode ser revertida."}
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
              Apagar permanentemente
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
