import { useState } from 'react';
import { Table as TanStackTable } from '@tanstack/react-table'; // Use alias to avoid name clash
import { VocabularyEntry } from '@/types/index.ts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area'; // Need to add this: npx shadcn-ui@latest add scroll-area
import { ChevronRight } from 'lucide-react';

import { MultiSelectFilter } from '@/components/common/MultiSelectFilter';

// Define the structure for hierarchy items (copy from step 1 or import)
interface ColumnItem {
  id: string;
  label: string;
  isGroup: boolean;
  children?: ColumnItem[];
  columnId?: string;
  isMultiSelect?: boolean;
}

interface ColumnFinderProps {
  table: TanStackTable<VocabularyEntry>; // Pass the table instance
  hierarchy: ColumnItem[]; // Pass the defined hierarchy
}

function ColumnFinder({ table, hierarchy }: ColumnFinderProps) {
  // State to track the selected path (IDs of selected items in each column)
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  // Function to handle selecting an item in a column
  const handleSelect = (item: ColumnItem, level: number) => {
    // Update path: keep items up to the current level, add the new item
    setSelectedPath((prevPath) => [...prevPath.slice(0, level), item.id]);
  };

  // Recursive function or loop to get the items to display at a specific level
  const getItemsForLevel = (level: number): ColumnItem[] => {
    if (level === 0) {
      return hierarchy; // Top level
    }
    let currentItems = hierarchy;
    for (let i = 0; i < level; i++) {
      const selectedId = selectedPath[i];
      const parent = currentItems.find(item => item.id === selectedId);
      if (parent && parent.isGroup && parent.children) {
        currentItems = parent.children;
      } else {
        return []; // No children to show for this path
      }
    }
    return currentItems;
  };

  // Determine how many columns to render based on the selected path
  const columnsToRender = [hierarchy]; // Start with root
  let currentItems = hierarchy;
  selectedPath.forEach(selectedId => {
     const parent = currentItems.find(item => item.id === selectedId);
     if (parent && parent.isGroup && parent.children) {
        columnsToRender.push(parent.children);
        currentItems = parent.children;
     }
  });


  return (
    // Use flex to lay out columns horizontally
    <div className="flex h-60 border rounded-md"> {/* Fixed height example, adjust as needed */}
      {columnsToRender.map((items, level) => (
        <ScrollArea key={`level-${level}`} className="h-full border-r"> {/* Fixed width column with scroll */}
          <div className="p-2">
            {items.map((item) => {
              const column = item.columnId ? table.getColumn(item.columnId) : undefined;
              const isSelected = selectedPath[level] === item.id;

              return (
                <div key={item.id} className="mb-1">
                  { column ? ( // Check if column exists in the table instance
                      <div className="flex items-center space-x-2 px-4 h-8">
                        <Checkbox
                          id={`vis-${column.id}`}
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        />
                        <Label
                          htmlFor={`vis-${column.id}`}
                          className="text-sm font-medium leading-none flex-1 truncate pr-8"
                          title={item.label} // Show full name on hover
                        >
                          {item.label}
                        </Label>
                        {item.isGroup ? (
                          // Render groups as selectable buttons
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelect(item, level)}
                            className={cn(
                              "px-2",
                              isSelected ? "bg-accent text-accent-foreground" : ""
                            )}
                          >
                            <ChevronRight size={16} />
                          </Button>
                        ) : (
                          <div></div>
                        )}
                      </div>
                    ) : (
                      <div className="pl-2 pr-2 h-8 text-muted-foreground text-sm italic">({item.label} - N/A)</div> // Column not found in table
                    )
                  }
                  { item.isMultiSelect ? (
                    <div>Todo: implement multiselect filter</div>
                  ) : (
                    <div></div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      ))}
    </div>
  );
}

export { ColumnFinder };