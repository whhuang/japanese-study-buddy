import { createColumnHelper } from '@tanstack/react-table';
import { VocabularyEntry } from '@/types/index.ts';
import { Checkbox } from "@/components/ui/checkbox";

// --- Column Type for Hierarchy ---
// (Keep this definition here or move to types/index.ts if used elsewhere)
export interface ColumnItem {
  id: string; // Unique ID for this item/group
  label: string; // Display label
  isGroup: boolean; // Is this a group or a final column?
  children?: ColumnItem[]; // If group, list children
  columnId?: string; // If column, corresponding TanStack Table column ID
  isColumnToggle?: boolean; // Is this a column toggle?
  isMultiSelect?: boolean; // 
}

// --- TanStack Table Column Definitions ---
const columnHelper = createColumnHelper<VocabularyEntry>();

export const columns = [ // <-- Export the array
  // --- Add Selection Column ---
  columnHelper.display({
    id: 'select',
    // Header Checkbox
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || // Checks if all rows on current page/view are selected
          (table.getIsSomePageRowsSelected() && "indeterminate") // Checks if some (but not all) are selected
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} // Toggles selection for all rows on page/view
        aria-label="Select all rows"
        className="" // Minor alignment adjustment
      />
    ),
    // Cell Checkbox
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()} // Checks if this specific row is selected
        onCheckedChange={(value) => row.toggleSelected(!!value)} // Toggles selection for this row
        aria-label="Select row"
        className=""
        // Prevent row click event when clicking checkbox
        onClick={(e) => e.stopPropagation()}
      />
    ),
    // Disable resizing, sorting, filtering etc. for this column
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    size: 40, // Fixed small size
    minSize: 40,
    maxSize: 40,
  }),
  // --- End Selection Column ---

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
    filterFn: 'arrIncludesSome',
  }),
  columnHelper.accessor('word_category', {
    header: 'Category',
    cell: info => info.getValue() ?? 'N/A',
    size: 100,
    filterFn: 'arrIncludesSome',
  }),
  columnHelper.accessor('times_seen', {
    header: 'Seen',
    size: 80,
    cell: info => info.getValue()
  }),
  columnHelper.accessor('recently_missed_percent', {
    header: 'Missed %',
    size: 100,
    cell: info => info.getValue().toFixed(2)
  }),
  columnHelper.accessor('flag', {
    header: 'Flag',
    size: 50,
    cell: info => info.getValue()
  }),
  columnHelper.accessor('book', {
    header: 'Book',
    size: 120,
    cell: info => info.getValue() ?? 'N/A'
  }),
  columnHelper.accessor('section', {
    header: 'Section',
    size: 80,
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('public_notes', {
    header: 'Public Notes',
    size: 200,
    cell: info => info.getValue() ?? 'N/A'
  }),
  columnHelper.accessor('personal_notes', {
    header: 'Personal Notes',
    size: 200,
    cell: info => info.getValue() ?? 'N/A'
  }),
];

// --- Column Finder Hierarchy Definition ---
export const columnHierarchy: ColumnItem[] = [ // <-- Export the array
  { id: 'col-english', label: 'English', isGroup: false, columnId: 'english' },
  { id: 'col-furigana', label: 'Furigana', isGroup: false, columnId: 'furigana' },
  { id: 'col-japanese', label: 'Japanese', isGroup: false, columnId: 'japanese' },
  { id: 'col-word_category', label: 'Category', isGroup: false, columnId: 'word_category' },
  { id: 'col-book', label: 'Book', isGroup: true, columnId: 'book', children: [
    { id: 'col-chapter', label: 'Chapter', isGroup: false, columnId: 'chapter', isMultiSelect: true },
  ]},
  { id: 'col-chapter', label: 'Chapter', isGroup: false, columnId: 'chapter' },
  { id: 'col-section', label: 'Section', isGroup: false, columnId: 'section' },
  { id: 'col-times_seen', label: 'Times Seen', isGroup: false, columnId: 'times_seen' },
  { id: 'col-recently_missed_percent', label: 'Missed %', isGroup: false, columnId: 'recently_missed_percent' },
  { id: 'col-flag', label: 'Flag', isGroup: false, columnId: 'flag' },
  { id: 'col-public_notes', label: 'Public Notes', isGroup: false, columnId: 'public_notes' },
  { id: 'col-personal_notes', label: 'Personal Notes', isGroup: false, columnId: 'personal_notes' },
];