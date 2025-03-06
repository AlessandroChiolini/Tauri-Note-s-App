use rusqlite::{Connection, Result};
use serde::Serialize;
use tauri::command;

// ======================
// 1. Data Structures
// ======================
#[derive(Serialize, Debug)]
struct Notebook {
    id: i32,
    title: String,
}

#[derive(Serialize, Debug)]
struct Note {
    id: i32,
    notebook_id: i32,
    title: String,
    content: String,
}

// ======================
// 2. Commands
// ======================

/// Fetch all notebooks from the `notebooks` table.
#[command]
fn get_notebooks() -> Result<Vec<Notebook>, String> {
    println!("🔍 get_notebooks called");

    // Path to your SQLite database.
    // If this doesn't work, try an absolute path like:
    // "C:/Users/aless/OneDrive/Bureau/Tauri-app/notes.db"
    let conn = Connection::open("C:/Users/aless/OneDrive/Bureau/Tauri-app/notes.db")
        .map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title FROM notebooks")
        .map_err(|e| e.to_string())?;

    let notebooks_iter = stmt
        .query_map([], |row| {
            Ok(Notebook {
                id: row.get(0)?,
                title: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let notebooks: Vec<Notebook> = notebooks_iter.filter_map(Result::ok).collect();
    println!("✅ Notebooks retrieved: {:?}", notebooks);

    Ok(notebooks)
}

/// Fetch notes for a specific notebook.
#[command]
fn get_notes(notebookId: i32) -> Result<Vec<Note>, String> {
    println!("🔍 get_notes called with notebook_id = {}", notebookId);

    // Same path as above, so we’re sure we're opening the same DB.
    let conn = Connection::open("C:/Users/aless/OneDrive/Bureau/Tauri-app/notes.db")
        .map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, notebook_id, title, content FROM notes WHERE notebook_id = ?")
        .map_err(|e| e.to_string())?;

    let notes_iter = stmt
        .query_map([notebookId], |row| {
            Ok(Note {
                id: row.get(0)?,
                notebook_id: row.get(1)?,
                title: row.get(2)?,
                content: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let notes: Vec<Note> = notes_iter.filter_map(Result::ok).collect();
    println!("✅ Notes retrieved: {:?}", notes);

    Ok(notes)
}

// ======================
// 3. The main function
// ======================
fn main() {
    tauri::Builder::default()
        // Register these commands so we can call them from React
        .invoke_handler(tauri::generate_handler![get_notebooks, get_notes])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
