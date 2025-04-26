import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import { invoke } from '@tauri-apps/api/core';
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function EditTablePage() {
  const navigate = useNavigate(); // Hook for navigation

  // --- State ---
  const [tsvInput, setTsvInput] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  // --- ---

  // --- Handler ---
  const handleTsvImport = async () => {
    if (!tsvInput.trim()) {
      setImportStatus('Please paste some tab-separated data.');
      return;
    }
    setIsImporting(true);
    setImportStatus('Importing...');
    try {
      const result: string = await invoke('add_vocabulary_entries_tsv', {
        tsvData: tsvInput
      });
      // Clear input and show status briefly before navigating
      setImportStatus(`Success: ${result}. Redirecting...`);
      setTsvInput('');
      setTimeout(() => navigate('/edit-table'), 1500); // Navigate after 1.5 seconds
    } catch (error) {
      console.error("Import failed:", error);
      setImportStatus(`Import failed: ${error}`);
    } finally {
      // Only set importing false if there was an error, otherwise wait for redirect
      if (importStatus.startsWith('Import failed:')) {
          setIsImporting(false);
      }
    }
  };
  // --- ---

  return (
    <div className="container p-4 mx-auto">
        <div className='flex items-center gap-4 mb-4'>
            <h1 className="text-2xl font-semibold">Import Vocabulary from TSV</h1>
        </div>

      {/* --- TSV Import Section --- */}
      <div className="my-6 p-4 border rounded-md max-w-2xl"> {/* Constrain width */}
          <p className="text-sm text-muted-foreground mb-2">
              Paste tab-separated data below. Assumes header row and columns matching the table structure (excluding ID). Each line will be added as a new entry.
          </p>
          <Textarea
              placeholder="English	Furigana  Japanese	Chapter	Category	Seen	Missed%	Flag	PublicNotes	PersonalNotes	Book	Section" // Update placeholder if needed
              value={tsvInput}
              onChange={(e) => setTsvInput(e.target.value)}
              rows={10} // Adjust rows as needed
              className="mb-2 font-mono text-sm" // Use monospace font for better alignment
              disabled={isImporting}
          />
          <Button onClick={handleTsvImport} disabled={isImporting}>
              {isImporting ? 'Importing...' : 'Add Entries from TSV'}
          </Button>
          {importStatus && (
              <p className={cn(
                  "mt-2 text-sm",
                  importStatus.startsWith('Import failed:') ? 'text-red-600' : 'text-muted-foreground'
              )}>
                  {importStatus}
              </p>
          )}
      </div>
      {/* --- End TSV Import Section --- */}
    </div>
  );
}

export default EditTablePage;