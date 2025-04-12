import { useState, useEffect, useMemo, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { VocabularyEntry } from '@/types/index.ts';
import '@/index.css';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnSizingState,
  VisibilityState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { NavButton } from '@/components/common/NavButton';
import { cn } from "@/lib/utils";

// --- shadcn/ui imports ---
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
// --- ---

import { columns, columnHierarchy } from '@/config/vocabularyColumns';
import { ColumnFinder } from "@/components/common/ColumnFinder";
import { MultiSelectFilter } from '@/components/common/MultiSelectFilter';

import { ArrowDownZA, ArrowUpZA, SquareChevronDown } from "lucide-react"

function VocabularyListPage() {
  // --- State ---
  const [data, setData] = useState<VocabularyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    'times_seen': false,
    'recently_missed_percent': false,
    'flag': false,
    'public_notes': false,
    'personal_notes': false,
    'book': false,
    'section': false,
  });
  // --- ---

  // --- Data Fetching ---
  // Wrap fetch logic in useCallback to prevent re-creating it on every render
  const fetchVocabulary = useCallback(() => {
    setLoading(true);
    invoke<VocabularyEntry[]>('get_vocabulary')
      .then(fetchedEntries => { setData(fetchedEntries); setError(null); })
      .catch(err => { console.error("Error:", err); setError('Failed fetch'); setData([]); })
      .finally(() => { setLoading(false); });
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    fetchVocabulary(); // Call it on initial mount
  }, [fetchVocabulary]); // Depend on the memoized fetch function
  // --- ---

  // --- Calculate Unique Options for Filters ---
  // Use useMemo to calculate only when data changes
  const sectionOptions = useMemo(() => {
    const uniqueSections = new Set(data.map(item => item.section));
    return Array.from(uniqueSections)
      .sort((a, b) => a - b) // Sort numerically
      .map(s => ({ label: `${s}`, value: s }));
  }, [data]);

  const chapterOptions = useMemo(() => {
    const uniqueChapters = new Set(data.map(item => item.chapter));
    return Array.from(uniqueChapters)
      .sort((a, b) => a - b) // Sort numerically
      .map(ch => ({ label: `Ch. ${ch}`, value: ch }));
  }, [data]);

  const categoryOptions = useMemo(() => {
    const uniqueCategories = new Set(data.map(item => item.word_category).filter(Boolean)); // Filter out null/undefined
    return Array.from(uniqueCategories)
       .sort() // Sort alphabetically
       .map(cat => ({ label: cat!, value: cat! })); // Map to label/value
  }, [data]);

  const bookOptions = useMemo(() => {
    const uniqueBooks = new Set(data.map(item => item.book).filter(Boolean)); // Filter out null/undefined
    return Array.from(uniqueBooks)
       .sort() // Sort alphabetically
       .map(b => ({ label: b!, value: b! })); // Map to label/value
  }, [data]);

  // Calculate options for book, section similarly if needed
  // --- ---

  // --- TanStack Table Instance ---
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter, // Keep or remove based on preference
      rowSelection,
      columnSizing,
      columnVisibility, // <-- Pass visibility state
      columnFilters, // <-- Pass filter state
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter, // Keep or remove
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility, // <-- Add visibility updater
    onColumnFiltersChange: setColumnFilters, // <-- Add filter updater
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // <-- Needs to be enabled
    enableRowSelection: true,
    getRowId: (row) => String(row.vocab_id),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    enableHiding: true, // Explicitly enable hiding columns
    // debugTable: true,
  });
  // --- ---

  return (
    <div className="container p-4 mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Study Vocabulary</h1>

      {/* --- Controls Row Above Table --- */}
      <div className="flex items-center gap-2 mb-4">
         {/* Global Filter Input */}
         <Input
          placeholder="Search all..." // Simplified placeholder
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-xs h-8" // Use max-w instead of max-w-sm
        />

         {/* Flashcard Button */}
         <NavButton to="/flashcard" variant="secondary" buttonClassName="h-8">
           Start Flashcards
         </NavButton>
      </div>
      {/* --- End Controls Row --- */}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {/* --- Collapsible Column Visibility Panel --- */}
      <Collapsible className="space-y-2 mb-4">
        <CollapsibleTrigger className="flex gap-2 items-center">
            <SquareChevronDown size={16} />
            Table settings
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ColumnFinder table={table} hierarchy={columnHierarchy} />
        </CollapsibleContent>
      </Collapsible>
      {/* --- End Collapsible --- */}

      {/* --- Table --- */}
      {!loading && !error && (
        <div className="rounded-md border overflow-x-auto">
          <Table className="table-fixed w-full"> {/* Keep table-fixed and w-full */}
            <TableHeader className="sticky top-0 z-10 bg-secondary"> {/* Example sticky header styling */}
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="relative p-2" // For resize handle
                      style={{ width: header.getSize() }} // Width from state
                    >
                      {/* Sorting Element & Header Text */}
                      <div
                        {...{
                          className: cn(
                            'truncate flex gap-2', // Truncate header text too
                             header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                          ),
                          onClick: header.column.getToggleSortingHandler(),
                           title: typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : undefined
                        }}
                      >
                        {{ asc: <ArrowUpZA size={16} />, desc: <ArrowDownZA size={16} /> }[header.column.getIsSorted() as string] ?? null}
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>

                      {/* --- Conditional Filter Rendering --- */}
                      {header.column.getCanFilter() ? (
                        <div className="mt-1">
                          {/* Check column ID to render specific filter */}
                          {header.column.id === 'section' ? (
                            <MultiSelectFilter
                              column={header.column}
                              title="Section"
                              options={sectionOptions}
                            />
                          ) : header.column.id === 'chapter' ? (
                            <MultiSelectFilter
                              column={header.column}
                              title="Chapters"
                              options={chapterOptions}
                            />
                          ) : header.column.id === 'word_category' ? (
                             <MultiSelectFilter
                              column={header.column}
                              title="Categories"
                              options={categoryOptions}
                            />
                          ) : header.column.id === 'book' ? (
                            <MultiSelectFilter
                             column={header.column}
                             title="Book"
                             options={bookOptions}
                           />
                         ) : (
                            // Default text input filter for other columns
                            <Input
                              placeholder={`Filter...`}
                              value={(header.column.getFilterValue() as string) ?? ''}
                              onChange={(event) =>
                                header.column.setFilterValue(event.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="max-w-full h-7 text-xs border rounded"
                            />
                          )}
                        </div>
                      ) : null}
                      {/* --- End Conditional Filter --- */}

                      {/* Resize Handle */}
                      {header.column.getCanResize() && (
                        <div
                          {...{
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                          }}
                          className={cn(
                             "absolute top-0 right-0 h-full w-1 bg-gray-300 dark:bg-gray-600 cursor-col-resize select-none touch-none opacity-0 hover:opacity-100",
                             header.column.getIsResizing() ? "bg-blue-500 opacity-100" : ""
                          )}
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => { row.toggleSelected(); }}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="truncate">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {/* --- End Table --- */}

       {/* Optional: Footer for selection count/pagination controls */}
       {/* <div className="flex items-center justify-end space-x-2 py-4"> ... </div> */}
    </div>
  );
}

export default VocabularyListPage;