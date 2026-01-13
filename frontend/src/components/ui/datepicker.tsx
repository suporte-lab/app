import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
};

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = value ? new Date(value) : undefined;

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1">Data</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-48 justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "Selecionar data"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(selected) => {
              if (!selected) return;
              onChange(selected.toISOString()); // ✅ store string
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
