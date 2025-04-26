// src/pages/FlashcardPage.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { VocabularyEntry } from '@/types/index.ts';
import { cn } from "@/lib/utils";
import { VOCAB_SELECTION_STORAGE_KEY } from '@/lib/constants';
import { RowSelectionState } from '@tanstack/react-table';

// --- shadcn/ui Imports ---
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// --- ---

// --- Icons (ensure lucide-react is installed) ---
import { ArrowLeft, ArrowRight, RefreshCw, Trash2, Flag } from 'lucide-react';
// --- ---

function FlashcardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- State ---
  // Store the original items passed via route state
  const [originalItems, setOriginalItems] = useState<VocabularyEntry[]>(() => {
      // Safely initialize from location state
      const items = location.state?.selectedItems;
      return Array.isArray(items) ? items : [];
  });
  // Track IDs removed in this session
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  // Index within the *active* list
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  // For feedback messages after actions
  const [feedbackMessage, setFeedbackMessage] = useState('');
  // --- ---

  // --- Calculate Active Items (derived state) ---
  // Filter original items based on removed IDs
  const activeItems = useMemo(() => {
    return originalItems.filter(item => !removedIds.has(item.vocab_id));
  }, [originalItems, removedIds]);
  const activeTotal = activeItems.length;
  // --- ---

  // --- Current Card ---
  // Get the card object from the active list
  const currentCard: VocabularyEntry | undefined = activeItems[currentIndex];
  // --- ---

  // --- Effect to handle initial load and potential direct navigation ---
  useEffect(() => {
    const itemsFromState = location.state?.selectedItems;
    if (!Array.isArray(itemsFromState) || itemsFromState.length === 0) {
      console.warn("No items passed to flashcard page or selection empty.");
      setOriginalItems([]); // Ensure it's an empty array
    } else {
      // Only update if the passed items are different (simple length check, could be deeper)
      if (originalItems.length !== itemsFromState.length) {
          setOriginalItems(itemsFromState);
      }
    }
    // Reset session state whenever the source items change
    setRemovedIds(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
    setFeedbackMessage('');
  }, [location.state?.selectedItems]); // Depend only on the route state value
  // --- ---


  // --- Handlers (Memoized) ---
  const handleNext = useCallback(() => {
    if (currentIndex < activeTotal - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setFeedbackMessage('');
    }
  }, [currentIndex, activeTotal]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      setFeedbackMessage('');
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    if (activeTotal > 0) {
      setIsFlipped(prev => !prev);
      setFeedbackMessage('');
    }
  }, [activeTotal]);

  const handleRemove = useCallback(() => {
    if (!currentCard) return;
    const cardIdToRemove = currentCard.vocab_id;
    const cardName = currentCard.english ?? `Item ${cardIdToRemove}`;

    // 1. Update local state for current session view
    setFeedbackMessage(`"${cardName}" removed from session.`);
    setRemovedIds(prev => new Set(prev).add(cardIdToRemove));
    setIsFlipped(false);

    // 2. Update persisted selection state in sessionStorage
    try {
        const storedSelectionString = sessionStorage.getItem(VOCAB_SELECTION_STORAGE_KEY);
        let currentSelection: RowSelectionState = {};
        if (storedSelectionString) {
            currentSelection = JSON.parse(storedSelectionString);
        }

        // Remove the key for the deselected item
        // The state stores keys for selected items, value is true
        if (currentSelection[String(cardIdToRemove)]) {
             delete currentSelection[String(cardIdToRemove)]; // Remove the key
             // Save the modified selection back to sessionStorage
             sessionStorage.setItem(VOCAB_SELECTION_STORAGE_KEY, JSON.stringify(currentSelection));
             console.log(`Removed ${cardIdToRemove} from persisted selection.`);
        }

    } catch (error) {
        console.error("Failed to update persisted row selection:", error);
        // Decide if you want to notify the user
    }


    // 3. Adjust index for the *current* session view (logic from before)
    const newTotal = activeItems.length - 1;
    if (newTotal <= 0) {
        setCurrentIndex(0);
    } else if (currentIndex >= newTotal) {
        setCurrentIndex(newTotal - 1);
    }

    setTimeout(() => setFeedbackMessage(''), 1500);

  }, [currentCard, currentIndex, activeItems]);

  const handleFlag = useCallback(async () => {
    if (!currentCard) return; // Safety check

    const vocabIdToFlag = currentCard.vocab_id;
    const cardName = currentCard.english ?? `Item ${vocabIdToFlag}`;
    const currentFlagState = currentCard.flag; // Get current flag (0 or 1)

    // Determine the new state (toggle)
    const newFlagValue = currentFlagState === 1 ? 0 : 1;
    const actionText = newFlagValue === 1 ? "flagged" : "unflagged";

    // Optimistic UI Update: Update the *original* list state immediately
    const originalIndex = originalItems.findIndex(item => item.vocab_id === vocabIdToFlag);
    if (originalIndex === -1) return; // Should not happen

    const updatedItems = [...originalItems];
    updatedItems[originalIndex] = { ...updatedItems[originalIndex], flag: newFlagValue };
    setOriginalItems(updatedItems); // Update the source state

    setIsFlipped(false); // Reset flip state just in case
    setFeedbackMessage(`"${cardName}" ${actionText}!`); // Updated feedback

    try {
      // Call backend with the new flag value
      await invoke('set_vocabulary_flag', {
          id: vocabIdToFlag,
          flagValue: newFlagValue // Pass the toggled value
      });
      // Success! Optimistic update is already done.
    } catch (error) {
      console.error("Failed to toggle flag item:", error);
      setFeedbackMessage(`Error ${actionText} item: ${error}`);
      // Revert optimistic update on error - use the original currentFlagState
      setOriginalItems(prevItems =>
        prevItems.map(item =>
          item.vocab_id === vocabIdToFlag ? { ...item, flag: currentFlagState } : item
        )
      );
    } finally {
      setTimeout(() => setFeedbackMessage(''), 1500); // Clear feedback
    }
  }, [currentCard, originalItems]);
  // --- ---

  // --- Keyboard Listener Effect ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Basic check to prevent shortcuts while typing in inputs elsewhere
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ': // Space bar
          event.preventDefault();
          handleFlip();
          break;
        case ',': // Comma for Remove
          handleRemove();
          break;
        case '/': // Forward Slash for Flag
          event.preventDefault(); // Prevent browser find
          handleFlag();
          break;
        default: break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); };
    // Depend on handlers
  }, [handlePrevious, handleNext, handleFlip, handleRemove, handleFlag]);
  // --- ---


  // --- Render Logic ---
  if (activeTotal === 0) {
    const message = originalItems.length > 0
      ? "All items removed from this session or session ended."
      : "No vocabulary items selected or passed to study.";
    return (
      <div className="container p-4 mx-auto text-center flex flex-col items-center">
        <div className='w-full max-w-md flex items-center gap-4 mb-4 justify-center relative'>
          {/* <div className="absolute left-0"><BackButton /></div> */}
          <h1 className="text-2xl font-semibold">Flashcards</h1>
        </div>
        <p className="text-muted-foreground mt-8">{message}</p>
        <Button onClick={() => navigate('/vocabulary')} className="mt-4">
            Back to Vocabulary List
        </Button>
      </div>
    );
  }

  // Ensure currentCard exists before rendering card details
  if (!currentCard) {
      // This might happen briefly if index/activeItems are out of sync
      return <div className="container p-4 mx-auto text-center">Loading card...</div>;
  }

  return (
    <div className="container p-4 mx-auto flex flex-col items-center">
      <div className='w-full max-w-md flex items-center gap-4 mb-2 justify-center relative'>
          {/* <div className="absolute left-0"><BackButton /></div> */}
          <h1 className="text-2xl font-semibold">Flashcards</h1>
          <div className="text-sm text-muted-foreground absolute right-0">
              {currentIndex + 1} / {activeTotal}
           </div>
      </div>

     {/* Feedback Area */}
     <div className="h-6 mb-2 text-sm text-muted-foreground text-center">
         {feedbackMessage}
     </div>

      {/* Flashcard */}
      <Card
         className="w-full max-w-md min-h-[200px] flex flex-col justify-center items-center text-center p-6 mb-4 cursor-pointer select-none"
         onClick={handleFlip} // Flip on card click
      >
        <CardContent className="text-2xl font-semibold">
           {!isFlipped ? (
            <p>{currentCard.english ?? 'N/A'}</p>
          ) : (
            <div>
              {currentCard.furigana && (
                <p className="text-sm text-muted-foreground">{currentCard.furigana}</p>
              )}
              <p>{currentCard.japanese ?? 'N/A'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Controls */}
      <div className="flex justify-center items-center gap-4 w-full max-w-md mt-4">
        <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0} className="px-6">
          <ArrowLeft className="mr-2 size-4" /> Prev
        </Button>
        <Button variant="secondary" onClick={handleFlip} className="px-6">
          <RefreshCw className="mr-2 size-4"/> Flip
        </Button>
        <Button variant="outline" onClick={handleNext} disabled={currentIndex >= activeTotal - 1} className="px-6">
          Next <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-4 w-full max-w-md mt-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleRemove} disabled={!currentCard}>
                 <Trash2 className="size-4"/>
                 <span className="sr-only">Remove from Session</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Remove from Session (shortcut: ,)</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleFlag} disabled={!currentCard}>
                 <Flag className={cn("size-4", currentCard.flag === 1 && "fill-primary text-primary")} />
                 <span className="sr-only">Flag Item</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Flag Item (shortcut: /)</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

    </div>
  );
}

export default FlashcardPage;