// src/pages/VocabularyListPage.tsx

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { VocabularyEntry } from '@/types/index.ts'; // Assuming types are in src/types/index.ts
import '@/index.css'; // Your global CSS file
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnSizingState, // <-- Import for resizing state type
} from '@tanstack/react-table';
import { NavButton } from '@/components/common/NavButton'; // If you use it on this page
import { cn } from "@/lib/utils";

// Import shadcn Table components
import {
  Table,
  TableBody,
  // TableCaption, // Optional
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Optional: Import shadcn Input if you want to replace the basic HTML input
// import { Input } from "@/components/ui/input";

// Define Columns
const columnHelper = createColumnHelper<VocabularyEntry>();
const columns = [
  // Define your columns - adjust accessor keys and headers
  // You can add size/minSize/maxSize here if needed for resizing defaults
   columnHelper.accessor('english', {
    header: 'English',
    cell: info => info.getValue() ?? 'N/A',
    size: 100,
    minSize: 30,
  }),
   columnHelper.accessor('japanese', {
    header: 'Japanese',
    cell: info => info.getValue() ?? 'N/A',
    size: 100,
    minSize: 30,
  }),
  columnHelper.accessor('furigana', {
    header: 'Furigana',
    cell: info => info.getValue() ?? 'N/A',
    size: 100,
  }),
  columnHelper.accessor('chapter', {
    header: 'Chapter',
    cell: info => info.getValue(),
    size: 80,
  }),
   columnHelper.accessor('word_category', {
    header: 'Category',
    cell: info => info.getValue() ?? 'N/A', // Handle potential null
    size: 100,
  }),
  // Add other columns from your VocabularyEntry type as needed
];

function VocabularyListPage() {
  // --- State ---
  const [data, setData] = useState<VocabularyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  // --- ---

  // --- Data Fetching ---
  useEffect(() => {
    setLoading(true);
    invoke<VocabularyEntry[]>('get_vocabulary')
      .then(fetchedEntries => {
        setData(fetchedEntries);
        setError(null);
      })
      .catch(err => {
        console.error("Error fetching vocabulary:", err);
        setError(typeof err === 'string' ? err : 'Failed fetch');
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  // --- ---

  // --- TanStack Table Instance ---
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnSizing, // Pass column sizing state
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: setColumnSizing, // Add column sizing updater
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    getRowId: (row) => String(row.vocab_id), // Use stable row ID
    enableColumnResizing: true, // Enable column resizing
    columnResizeMode: 'onChange', // How resizing updates state
    // Optional: Define default column settings (e.g., initial size)
    // defaultColumn: {
    //   size: 150, // Default size for columns without explicit size
    //   minSize: 50,
    //   maxSize: 500,
    // },
    // debugTable: true, // Uncomment for debugging TanStack Table state
  });
  // --- ---

  return (
    <div className="container p-4 mx-auto"> {/* Basic container styling */}
      <h1 className="text-2xl font-semibold mb-4">Study Vocabulary</h1>

      <div className="flex justify-between items-center mb-4">
        {/* Flashcard Button */}
        <NavButton to="/flashcard" variant="secondary">
          Start flashcard study session
        </NavButton>

        {/* Global Filter Input */}
        <input // Replace with <Input /> from shadcn if you added it
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search all columns..."
          className="max-w-sm p-2 border rounded" // Basic styling - use shadcn Input for better look
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {/* --- Table --- */}
      {!loading && !error && (
        <div className="rounded-md border"> {/* Scroll wrapper */}
          <Table
            // Optional: Add table-fixed if needed, but resizing might handle layout well
            className="table-fixed w-full"
          >
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "relative sticky top-0 z-10",
                        "bg-secondary inset-ring-2 inset-ring-neutral-200 rounded-t-sm",
                        // --- Keep existing classes for width/sorting ---
                        header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        // NOTE: Remove static width classes if you want sticky headers
                        // to determine width based on the initial table layout,
                        // or keep them if combined with table-fixed and resizing.
                        // Consider if width style should be applied here or via style prop
                      )}
                      style={{ width: header.getSize() }} // Width driven by state
                    >
                      {header.isPlaceholder
                        ? null
                        : (
                          <div // Sorting handler div
                            {...{
                              className: cn(
                                'truncate',
                                header.column.getCanSort()
                                  ? 'cursor-pointer select-none'
                                  : '',
                              ),
                              onClick: header.column.getToggleSortingHandler(),
                              title: typeof header.column.columnDef.header === 'string'
                                  ? header.column.columnDef.header
                                  : undefined
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{ // Sorting indicator
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      {/* Resize Handle */}
                      {header.column.getCanResize() && (
                        <div
                          {...{
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                          }}
                          className={cn(
                            "absolute top-0 right-0 h-full w-1 cursor-col-resize select-none touch-none opacity-0 hover:opacity-100",
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
                    data-state={row.getIsSelected() && "selected"} // For shadcn selected style
                    onClick={() => { row.toggleSelected(); }} // Selection toggle
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="truncate"> {/* Truncate long cell content */}
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

      {/* Optional: Display selected row count */}
      {/* <p className="mt-4 text-sm text-muted-foreground">
        {Object.keys(rowSelection).length} of {table.getRowCount()} row(s) selected.
      </p> */}
    </div>
  );
}

export default VocabularyListPage;