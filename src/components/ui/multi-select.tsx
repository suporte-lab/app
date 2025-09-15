import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function MultiSelect({
  options,
  placeholder,
  selectedLabel,
  value,
  onChange,
  size,
}: {
  options: { label: string; value: string }[];
  placeholder?: string;
  selectedLabel?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  size?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(value ?? []);

  const toggleOption = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  React.useEffect(() => {
    onChange?.(selected);
  }, [selected]);

  React.useEffect(() => {
    setSelected(value ?? []);
  }, [value]);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-96 max-w-full justify-between", size)}
          >
            {selected.length > 0 ? (
              <div className="flex overflow-hidden gap-1">
                {selected.length} {selectedLabel ?? "options selected"}
              </div>
            ) : (
              (placeholder ?? "Select values...")
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-96 max-w-full p-0", size)}>
          <Command>
            <CommandInput placeholder="..." />
            <CommandList>
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((val) => (
            <Badge key={val} variant="secondary">
              {options.find((o) => o.value === val)?.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
