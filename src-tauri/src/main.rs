// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{params, Connection, Result};
use serde::{Serialize, Deserialize};
use std::sync::Mutex;
use tauri::Manager;

// Define the struct matching your table (including assumed primary key)
#[derive(Serialize, Deserialize, Debug)]
struct VocabularyEntry {
    vocab_id: i64,
    english: Option<String>,
    furigana: Option<String>,
    japanese: Option<String>,
    times_seen: i64,
    recently_missed_percent: f64,
    flag: i64,
    public_notes: Option<String>,
    personal_notes: Option<String>,
    book: Option<String>,
    chapter: i64,
    section: i64,
    word_category: Option<String>,
}

// State struct remains the same
struct DbState(Mutex<Connection>);

// Updated command to fetch vocabulary entries
#[tauri::command]
fn get_vocabulary(state: tauri::State<DbState>) -> Result<Vec<VocabularyEntry>, String> {
    let conn_guard = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn_guard
        .prepare("SELECT vocab_id, english, furigana, japanese, times_seen, recently_missed_percent, flag, public_notes, personal_notes, book, chapter, section, word_category FROM vocabulary")
        .map_err(|e| e.to_string())?;

    let entries_iter = stmt
        .query_map([], |row| {
            // Note: Column indices start at 0
            Ok(VocabularyEntry {
                vocab_id: row.get(0)?,
                english: row.get(1)?,
                furigana: row.get(2)?,
                japanese: row.get(3)?,
                times_seen: row.get(4)?,
                recently_missed_percent: row.get(5)?,
                flag: row.get(6)?,
                public_notes: row.get(7)?,
                personal_notes: row.get(8)?,
                book: row.get(9)?,
                chapter: row.get(10)?,
                section: row.get(11)?,
                word_category: row.get(12)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    for entry_result in entries_iter {
        entries.push(entry_result.map_err(|e| e.to_string())?);
    }
    Ok(entries)
}

#[tauri::command]
fn add_vocabulary_entries_tsv(tsv_data: String, state: tauri::State<DbState>) -> Result<String, String> {
    let mut conn_guard = state.0.lock().map_err(|e| e.to_string())?;
    let mut inserted_count = 0;
    let mut skipped_lines = Vec::new();

    // Start transaction
    let tx = conn_guard.transaction().map_err(|e| format!("Failed to start transaction: {}", e))?;

    {
        // Prepare INSERT statement (adjust column names/order to match your table exactly, except vocab_id)
        // IMPORTANT: The number of '?' must match the number of columns listed.
        let sql = "INSERT INTO vocabulary (english, furigana, japanese, chapter, word_category, times_seen, recently_missed_percent, flag, public_notes, personal_notes, book, section) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)";
        let mut stmt = tx.prepare_cached(sql).map_err(|e| format!("Failed to prepare statement: {}", e))?;

        // Process lines, skipping header
        for (index, line) in tsv_data.lines().enumerate().skip(1) {
            if line.trim().is_empty() { continue; } // Skip empty lines

            let fields: Vec<&str> = line.split('\t').collect();

            // !! Adjust expected field count based on your INSERT statement !!
            let expected_fields = 12;
            if fields.len() != expected_fields {
                skipped_lines.push(index + 1); // Record line number (1-based)
                continue; // Skip rows with incorrect number of fields
            }

            // Attempt to parse and insert - adapt types and default values as needed
            // This requires careful handling based on your actual schema and TSV format
            let result = stmt.execute(params![
                fields.get(0).map(|s| if s.is_empty() { None } else { Some(*s) }), // english (Option<String>)
                fields.get(1).map(|s| if s.is_empty() { None } else { Some(*s) }), // furigana
                fields.get(2).map(|s| if s.is_empty() { None } else { Some(*s) }), // japanese
                fields.get(3).and_then(|s| s.parse::<i64>().ok()), // chapter (i64) - None if parse fails
                fields.get(4).map(|s| if s.is_empty() { None } else { Some(*s) }), // word_category
                fields.get(5).and_then(|s| s.parse::<i64>().ok()).unwrap_or(0), // times_seen (i64) - default 0
                fields.get(6).and_then(|s| s.parse::<f64>().ok()).unwrap_or(0.0), // recently_missed_percent (f64) - default 0.0
                fields.get(7).and_then(|s| s.parse::<i64>().ok()).unwrap_or(0), // flag (i64) - default 0
                fields.get(8).map(|s| if s.is_empty() { None } else { Some(*s) }), // public_notes
                fields.get(9).map(|s| if s.is_empty() { None } else { Some(*s) }), // personal_notes
                fields.get(10).map(|s| if s.is_empty() { None } else { Some(*s) }), // book
                fields.get(11).and_then(|s| s.parse::<i64>().ok()), // section (i64) - None if parse fails
            ]);

            match result {
                Ok(rows_affected) if rows_affected > 0 => inserted_count += 1,
                Ok(_) => skipped_lines.push(index + 1), // No rows affected (shouldn't happen on INSERT unless constraint failed?)
                Err(e) => {
                    eprintln!("Error inserting line {}: {}", index + 1, e); // Log specific error
                    skipped_lines.push(index + 1);
                    // Optionally: Abort transaction on first error?
                    // tx.rollback().map_err(|re| format!("Insert failed on line {} ({}) and rollback failed: {}", index + 1, e, re))?;
                    // return Err(format!("Insert failed on line {}: {}", index + 1, e));
                }
            }
        }
    }

    // Commit transaction
    tx.commit().map_err(|e| format!("Failed to commit transaction: {}", e))?;

    // Create status message
    let mut status = format!("Successfully inserted {} entries.", inserted_count);
    if !skipped_lines.is_empty() {
        status.push_str(&format!(" Skipped {} lines (e.g., {:?}). Check logs for details.", skipped_lines.len(), skipped_lines.iter().take(5).collect::<Vec<_>>()));
    }

    Ok(status)
}

#[tauri::command]
fn set_vocabulary_flag(id: i64, flag_value: i64, state: tauri::State<DbState>) -> Result<(), String> {
    let conn_guard = state.0.lock().map_err(|e| e.to_string())?;

    conn_guard.execute(
        "UPDATE vocabulary SET flag = ?1 WHERE vocab_id = ?2",
        params![flag_value, id],
    )
    .map_err(|e| format!("Failed to update flag for id {}: {}", id, e))?;
    // .map(|_| ()) // Alternative way to return Result<(), Error> if needed by types

    println!("Flag set to {} for vocab_id {}", flag_value, id); // Optional log
    Ok(())
}

// --- In main function ---
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
             // Ensure get_db_path is defined and DbState setup is correct
             let db_path = get_db_path(&app.handle());
             let conn = Connection::open(&db_path)
                  .map_err(|e| format!("Failed to open DB at {:?}: {}", db_path, e))?;
             app.manage(DbState(Mutex::new(conn)));
             Ok(())
         })
        .invoke_handler(tauri::generate_handler![
            // Update command name here
            get_vocabulary,
            add_vocabulary_entries_tsv,
            set_vocabulary_flag
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Assuming get_db_path is defined correctly using v2 API
use std::path::PathBuf;
fn get_db_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let path = app_handle.path().app_data_dir().expect("Failed to get app data dir").join("data.db");
    if let Some(parent) = path.parent() { if !parent.exists() { std::fs::create_dir_all(parent).expect("Failed to create dir"); }}
    println!("DB Path: {:?}", path);
    path
}