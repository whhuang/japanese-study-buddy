// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{Connection, Result};
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


// --- In main function ---
fn main() {
    tauri::Builder::default()
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
            get_vocabulary
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