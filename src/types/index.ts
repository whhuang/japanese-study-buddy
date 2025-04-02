// --- VocabularyEntry Interface (ensure it matches Rust struct and DB schema) ---
export interface VocabularyEntry {
  vocab_id: number;
  english: string | null;
  furigana: string | null;
  japanese: string | null;
  times_seen: number;
  recently_missed_percent: number;
  flag: number;
  public_notes: string | null;
  personal_notes: string | null;
  book: string | null;
  chapter: number;
  section: number;
  word_category: string | null;
}
// --- ---
