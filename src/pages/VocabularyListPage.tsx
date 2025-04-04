import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { VocabularyEntry } from '@/types/index.ts';
import '@/index.css';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
} from '@tanstack/react-table';

import { NavButton } from '@/components/common/NavButton';

const columnHelper = createColumnHelper<VocabularyEntry>();

const columns = [
  columnHelper.accessor('english', {
    header: 'English',
    cell: info => info.getValue() ?? 'N/A',
  }),
   columnHelper.accessor('japanese', {
    header: 'Japanese',
    cell: info => info.getValue() ?? 'N/A',
  }),
  columnHelper.accessor('furigana', {
    header: 'Furigana',
    cell: info => info.getValue() ?? 'N/A',
  }),
  columnHelper.accessor('chapter', {
    header: 'Chapter',
    cell: info => info.getValue(),
  }),
   columnHelper.accessor('word_category', {
    header: 'Category',
    cell: info => info.getValue(),
  }),
];

function VocabularyListPage() {
  const [data, setData] = useState<VocabularyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // --- STATE FOR TABLE FEATURES ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  // --- ---

  useEffect(() => {
    setLoading(true);
    invoke<VocabularyEntry[]>('get_vocabulary')
      .then(fetchedEntries => { setData(fetchedEntries); setError(null); })
      .catch(err => { console.error("Error:", err); setError('Failed fetch'); setData([]); })
      .finally(() => { setLoading(false); });
  }, []);

  // --- TanStack Table Hook ---
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    // Provide a stable row ID using your unique vocab_id
    getRowId: (row) => String(row.vocab_id), // Use String() in case IDs are numbers
    // debugTable: true, // Keep for debugging if needed
  });
  // --- -----

  return (
    <div className="container">
      <h1>Study Vocabulary</h1>

      <NavButton to="/flashcard" variant="secondary" buttonClassName="my-4">
        Start flashcard study session
      </NavButton>

      {/* --- Global Filter Input --- */}
      <div style={{ marginBottom: '10px' }}>
        <input
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search all columns..."
          style={{ padding: '5px' }}
        />
      </div>
      {/* --- --- */}


      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && (
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                       // --- Make Header Clickable for Sorting ---
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none' // Add CSS classes
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {/* Add Sorting Indicator */}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                       // --- ---
                    )}
                    {/* Add per-column filter inputs here if needed later */}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              // --- Make Row Selectable/Clickable ---
              <tr
                key={row.id}
                onClick={() => {
                    console.log("Row clicked:", row.original.vocab_id);
                    row.toggleSelected(); // Toggle selection on click
                    console.log("Selected Row Data:", row.original); // Example action
                 }}
                // Add conditional styling for selected rows
                style={{
                    cursor: 'pointer',
                    backgroundColor: row.getIsSelected() ? '#C7E9B0' : 'transparent' // Example highlight
                }}
                // className={row.getIsSelected() ? 'row-selected' : ''} // Or use CSS classes
              >
              {/* --- --- */}
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {/* Style content inside TD as cards if desired */}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      { !loading && !error && data.length === 0 && <p>No vocabulary entries found.</p>}

       {/* Optional: Display selected row count */}
       {/* <p>{Object.keys(rowSelection).length} row(s) selected</p> */}

    </div>
  );
}

export default VocabularyListPage;