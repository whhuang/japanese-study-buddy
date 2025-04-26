// src/components/common/IntegerRangeFilter.tsx

import React, { useState, useEffect } from 'react';
import type { Column } from '@tanstack/react-table';
import { Input } from '@/components/ui/input'; // Assuming shadcn Input

interface IntegerRangeFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

export function IntegerRangeFilter<TData, TValue>({
  column,
}: IntegerRangeFilterProps<TData, TValue>) {
  // Get the current filter value from the table state (should be a string)
  const columnFilterValue = (column.getFilterValue() as string) ?? '';

  // Local state for the input field value
  const [value, setValue] = useState(columnFilterValue);

  // Effect to sync local state if external filter value changes (e.g., cleared globally)
  useEffect(() => {
     // Only update local state if it differs from the table state
     if (value !== columnFilterValue) {
        setValue(columnFilterValue);
     }
   }, [columnFilterValue]); // Dependency only on the value from the table state

  // Effect to debounce input changes before updating the table filter state
  useEffect(() => {
    const timeout = setTimeout(() => {
       // Update the table's column filter state after 300ms of inactivity
       // Check if value actually changed from what table state already has
       if (value !== columnFilterValue) {
          column.setFilterValue(value);
       }
    }, 300); // Debounce time in milliseconds

    // Cleanup function to clear the timeout if value changes again quickly
    return () => clearTimeout(timeout);
  }, [value, column, columnFilterValue]); // Rerun effect when local value or column changes

  return (
    <Input
      placeholder={`Filter (e.g., 1-5, 8)...`}
      value={value} // Bind input to local state
      onChange={(e) => setValue(e.target.value)} // Update local state on change
      // Prevent clicks inside the input from triggering sorting on the header
      onClick={(e) => e.stopPropagation()}
      // Match styling used for other header filters
      className="max-w-full h-7 text-xs border rounded"
    />
  );
}