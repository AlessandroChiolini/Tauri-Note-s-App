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

#[command]
fn create_notebook(title: String) -> Result<Notebook, String> {
    println!("🔨 create_notebook called with title = {}", title);

    let conn = Connection::open("C:/Users/aless/OneDrive/Bureau/Tauri-app/notes.db")
        .map_err(|e| e.to_string())?;

    // Insert a new row into the `notebooks` table
    conn.execute("INSERT INTO notebooks (title) VALUES (?)", [title.as_str()])
        .map_err(|e| e.to_string())?;

    // Get the newly inserted row's ID
    let row_id = conn.last_insert_rowid();

    // Return the newly created Notebook
    Ok(Notebook {
        id: row_id as i32,
        title,
    })
}

#[command]
fn create_note(notebookId: i32, title: String) -> Result<Note, String> {
    let conn = Connection::open("C:/Users/aless/OneDrive/Bureau/Tauri-app/notes.db")
        .map_err(|e| e.to_string())?;

    // On insère un contenu vide par défaut
    let default_content = "";
    conn.execute(
        "INSERT INTO notes (notebook_id, title, content) VALUES (?, ?, ?)",
        (notebookId, title.as_str(), default_content),
    )
    .map_err(|e| e.to_string())?;

    let row_id = conn.last_insert_rowid();

    // On renvoie quand même la note (avec contenu vide)
    Ok(Note {
        id: row_id as i32,
        notebook_id: notebookId,
        title,
        content: String::from(default_content),
    })
}

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

#[command]
fn update_note_content(noteId: i32, newContent: String) -> Result<(), String> {
    println!(
        "✏️ update_note_content called for noteId = {}, newContent = {}",
        noteId, newContent
    );

    let conn = Connection::open("C:/Users/aless/OneDrive/Bureau/Tauri-app/notes.db")
        .map_err(|e| e.to_string())?;

    let affected_rows = conn
        .execute(
            "UPDATE notes SET content = ? WHERE id = ?",
            (newContent.as_str(), noteId),
        )
        .map_err(|e| e.to_string())?;

    println!("Affected rows: {}", affected_rows);

    if affected_rows == 0 {
        Err(format!("No note found with id {}", noteId))
    } else {
        println!("✅ Note updated successfully. New content overrides the old one.");
        Ok(())
    }
}

// ======================
// 3. The main function
// ======================
fn main() {
    tauri::Builder::default()
        // Register these commands so we can call them from React
        .invoke_handler(tauri::generate_handler![
            get_notebooks,
            get_notes,
            create_notebook,
            create_note,
            update_note_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
