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
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Column } from "@tanstack/react-table";

interface MultiSelectFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  title?: string; // e.g., "Select Categories"
  options: { // Unique options for this column
    label: string;
    value: string | number; // Assuming string or number values
  }[];
}

export function MultiSelectFilter<TData, TValue>({
  column,
  title,
  options,
}: MultiSelectFilterProps<TData, TValue>) {
  const filterValues = (column.getFilterValue() as (string | number)[]) ?? [];

  const handleSelect = (value: string | number) => {
    const newValues = filterValues.includes(value)
      ? filterValues.filter((v) => v !== value) // Remove value
      : [...filterValues, value]; // Add value
    column.setFilterValue(newValues.length > 0 ? newValues : undefined); // Set undefined if empty to clear filter
  };

  const handleClear = (e: React.MouseEvent) => {
     e.stopPropagation(); // Prevent popover opening
     column.setFilterValue(undefined); // Clear filter
  };

  return (
    <Popover>
        <PopoverTrigger>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between h-7 text-xs" // Match input style
          >
            Filter...
            <ChevronsUpDown className="ml-1 size-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Command>
            <CommandInput placeholder="Search" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
              <ScrollArea className="max-h-48">
                {options.map((option) => {
                  const isSelected = filterValues.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={String(option.value)}
                      onSelect={() => {
                        handleSelect(option.value);
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
    </Popover>
  );
}