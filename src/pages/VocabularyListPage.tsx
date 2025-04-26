// src/pages/VocabularyListPage.tsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { invoke } from '@tauri-apps/api/core';
import { VocabularyEntry } from '@/types/index.ts';
import { VOCAB_SELECTION_STORAGE_KEY } from '@/lib/constants';
import '@/index.css';

// --- TanStack Table Imports ---
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
  RowSelectionState,
} from '@tanstack/react-table';
// --- ---

// --- Utility and Component Imports ---
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColumnFinder } from "@/components/common/ColumnFinder";
import { MultiSelectFilter } from '@/components/common/MultiSelectFilter';
import { IntegerRangeFilter } from '@/components/common/IntegerRangeFilter';
// --- ---

// --- Column/Hierarchy Import ---
import { columns as tableColumnsDefinition, columnHierarchy } from '@/config/vocabularyColumns';
// --- ---

// --- Icons ---
import { ArrowDownZA, ArrowUpZA, SquareChevronDown } from "lucide-react";
// --- ---

function VocabularyListPage() {
  // --- State ---
  const [data, setData] = useState<VocabularyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // For initial data load
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Initial column visibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
     'times_seen': false, 'recently_missed_percent': false, 'flag': false,
     'public_notes': false, 'personal_notes': false, 'book': false, 'section': false,
  });

  // --- Row Selection State (Persistence) ---
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(() => {
    const storedSelection = sessionStorage.getItem(VOCAB_SELECTION_STORAGE_KEY);
    if (storedSelection) {
      try {
        return JSON.parse(storedSelection);
      } catch (error) {
        console.error("Failed to parse stored row selection:", error);
        return {}; // Fallback
      }
    }
    return {}; // Default empty
  });
  // --- ---

  const navigate = useNavigate();

  // --- Data Fetching ---
  const fetchVocabulary = useCallback(() => {
    setLoading(true);
    invoke<VocabularyEntry[]>('get_vocabulary')
      .then(fetchedEntries => { setData(fetchedEntries); setError(null); })
      .catch(err => { console.error("Error fetching vocabulary:", err); setError('Failed fetch'); setData([]); })
      .finally(() => { setLoading(false); });
  }, []);

  useEffect(() => {
    fetchVocabulary();
  }, [fetchVocabulary]);
  // --- ---

  // --- Effect to SAVE rowSelection TO Session Storage ---
  useEffect(() => {
    // Save whenever rowSelection changes
    sessionStorage.setItem(VOCAB_SELECTION_STORAGE_KEY, JSON.stringify(rowSelection));
    // console.log("Saved selection to session storage:", rowSelection); // Optional log
  }, [rowSelection]); // Dependency array includes rowSelection
  // --- ---

  // --- Calculate data to pass to the table ---
  const displayData = useMemo(() => {
    if (showSelectedOnly) {
      // Get the IDs of the selected rows (keys of the rowSelection object)
      const selectedIds = new Set(Object.keys(rowSelection));
      // Filter the original data
      return data.filter(item => selectedIds.has(String(item.vocab_id)));
    }
    // If not filtering by selected, return the original data
    return data;
  }, [data, rowSelection, showSelectedOnly]); // Recalculate when these change
  // --- ---

  // --- Options Calculation (useMemo - keep as is) ---
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
  // --- ---


  // --- TanStack Table Instance ---
  const table = useReactTable({
    data: displayData,
    columns: tableColumnsDefinition,
    state: {
      sorting, globalFilter, rowSelection, columnSizing, columnVisibility, columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection, // Setter is the same
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    getRowId: (row) => String(row.vocab_id),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    enableHiding: true,
  });
  // --- ---

  // --- Flashcard Navigation ---
  const handleStartFlashcards = () => {
    const selectedRows = table.getSelectedRowModel().flatRows;
    if (selectedRows.length === 0) {
      // Optional: Show a message if nothing is selected
      console.warn("No rows selected for flashcards.");
      return;
    }
    const selectedItems = selectedRows.map(row => row.original);
    // Navigate to flashcard page and pass selected items in state
    navigate('/flashcard', { state: { selectedItems: selectedItems } });
  };
  // --- ---

  return (
    <div className="container p-4 mx-auto">
       <h1 className="text-2xl font-semibold mb-4">Study Vocabulary</h1>

       {/* Controls Row */}
       <div className="flex items-center gap-2 mb-4">
         <Input placeholder="Search all..." value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-xs h-8" />
         <Button variant="secondary" className="h-8 ml-auto" onClick={handleStartFlashcards} disabled={Object.keys(rowSelection).length === 0}>
           Start Flashcards ({Object.keys(rowSelection).length})
         </Button>
       </div>

       {loading && <p>Loading...</p>}
       {error && <p className="text-red-600">Error: {error}</p>}

       {/* Collapsible Settings */}
       <Collapsible className="space-y-2 mb-4">
         <CollapsibleTrigger className="flex gap-2 items-center text-sm text-muted-foreground hover:text-foreground">
           <SquareChevronDown size={16} /> Table settings
         </CollapsibleTrigger>
         <CollapsibleContent>
           <ColumnFinder table={table} hierarchy={columnHierarchy} />
         </CollapsibleContent>
       </Collapsible>

       <Button
          variant={showSelectedOnly ? "secondary" : "outline"} // Change appearance when active
          size="sm" // Use smaller size consistent with other controls
          className="h-8 mb-4"
          onClick={() => setShowSelectedOnly(prev => !prev)} // Toggle state
          title={showSelectedOnly ? "Show all rows" : "Show only selected rows"}
        >
          {showSelectedOnly ? "Show All" : "Show Only Selected"}
      </Button>

       {/* Table */}
       {!loading && !error && (
         <div className="rounded-md border overflow-x-auto">
           <Table className="table-fixed w-full">
             <TableHeader className="sticky top-0 z-10 bg-secondary">
               {table.getHeaderGroups().map(headerGroup => (
                 <TableRow key={headerGroup.id}>
                   {headerGroup.headers.map(header => (
                     <TableHead key={header.id} colSpan={header.colSpan} className="relative p-2" style={{ width: header.getSize() }}>
                       {/* Header Content */}
                       <div /* ... sorting div ... */ onClick={header.column.getToggleSortingHandler()}>
                         {{ asc: <ArrowUpZA size={16} />, desc: <ArrowDownZA size={16} /> }[header.column.getIsSorted() as string] ?? null}
                         {flexRender(header.column.columnDef.header, header.getContext())}
                       </div>
                       {/* Conditional Filters */}
                       {header.column.getCanFilter() ? (
                         <div className="mt-1">
                           { header.column.id === 'section' || header.column.id === 'chapter' ? (<IntegerRangeFilter column={header.column} />)
                             : header.column.id === 'word_category' || header.column.id === 'book' ? (<MultiSelectFilter column={header.column} title={header.column.id === 'word_category' ? 'Category' : 'Book'} options={header.column.id === 'word_category' ? categoryOptions : bookOptions}/>)
                             : header.column.id === 'select' ? null
                             : (<Input placeholder={`Filter...`} value={(header.column.getFilterValue() as string) ?? ''} onChange={(e) => header.column.setFilterValue(e.target.value)} onClick={(e) => e.stopPropagation()} className="max-w-full h-7 text-xs border rounded" />)
                           }
                         </div>
                       ) : null}
                       {/* Resize Handle */}
                       {header.column.getCanResize() && (<div /* ... resize handle ... */ />)}
                     </TableHead>
                   ))}
                 </TableRow>
               ))}
             </TableHeader>
             <TableBody>
               {/* Row Rendering Logic - check if table.getRowModel().rows exists */}
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map(row => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} onClick={() => { row.toggleSelected(); }} className="cursor-pointer">
                            {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id} className="truncate">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={tableColumnsDefinition.length} className="h-24 text-center">No results found.</TableCell></TableRow>
                )}
             </TableBody>
           </Table>
         </div>
       )}

       {/* Footer Info */}
       <div className="flex items-center justify-end space-x-2 py-4 text-sm text-muted-foreground">
          {Object.keys(rowSelection).length} of {table.getFilteredRowModel().rows.length} row(s) selected.
       </div>

    </div>
  );
}

export default VocabularyListPage;