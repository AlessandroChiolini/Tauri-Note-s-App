// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::env;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::command;

// Structure for a Notebook
#[derive(Serialize, Deserialize)]
struct Notebook {
    id: i32,
    title: String,
}

// Structure for a Note
#[derive(Serialize, Deserialize)]
struct Note {
    id: i32,
    notebook_id: i32,
    title: String,
    content: String,
}

// Mutex for safe database access
struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    fn new() -> Result<Self> {
        let db_path = r"C:\Users\aless\OneDrive\Bureau\Tauri-app\notes.db";
        let conn = Connection::open(db_path)?;

        // Create Notebooks Table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS notebooks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL
            )",
            [],
        )?;

        // Create Notes Table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                notebook_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE
            )",
            [],
        )?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }
}

// Add a new notebook
#[command]
fn add_notebook(database: tauri::State<Database>, title: String) -> Result<(), String> {
    let conn = database.conn.lock().unwrap();
    conn.execute("INSERT INTO notebooks (title) VALUES (?1)", params![title])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// Get all notebooks
#[command]
fn get_notebooks(database: tauri::State<Database>) -> Result<Vec<Notebook>, String> {
    let conn = database.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, title FROM notebooks")
        .map_err(|e| e.to_string())?;
    let notebooks = stmt
        .query_map([], |row| {
            Ok(Notebook {
                id: row.get(0)?,
                title: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(notebooks)
}

// Delete a notebook and its notes
#[command]
fn delete_notebook(database: tauri::State<Database>, notebook_id: i32) -> Result<(), String> {
    let conn = database.conn.lock().unwrap();
    conn.execute("DELETE FROM notebooks WHERE id = ?1", params![notebook_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// Add a new note
#[tauri::command]
fn add_note(
    database: tauri::State<Database>,
    notebook_id: i32,
    title: String,
    content: String,
) -> Result<(), String> {
    let conn = database.conn.lock().unwrap();

    // Check if the notebook exists before inserting the note
    let notebook_exists: bool = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM notebooks WHERE id = ?1)",
            params![notebook_id],
            |row| row.get(0),
        )
        .unwrap_or(false);

    if !notebook_exists {
        return Err(format!("Notebook with ID {} does not exist", notebook_id));
    }

    // Insert the new note
    match conn.execute(
        "INSERT INTO notes (notebook_id, title, content) VALUES (?1, ?2, ?3)",
        params![notebook_id, title, content],
    ) {
        Ok(rows) => {
            println!(
                "Note added successfully: {} - {} (Rows affected: {})",
                title, content, rows
            );
            Ok(())
        }
        Err(e) => {
            println!("Error adding note: {}", e);
            Err(e.to_string())
        }
    }
}

// Get notes for a specific notebook
#[command]
fn get_notes(database: tauri::State<Database>, notebook_id: i32) -> Result<Vec<Note>, String> {
    let conn = database.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, notebook_id, title, content FROM notes WHERE notebook_id = ?1")
        .map_err(|e| e.to_string())?;
    let notes = stmt
        .query_map(params![notebook_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                notebook_id: row.get(1)?,
                title: row.get(2)?,
                content: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(notes)
}

// Update a note
#[command]
fn update_note(
    database: tauri::State<Database>,
    note_id: i32,
    title: String,
    content: String,
) -> Result<(), String> {
    let conn = database.conn.lock().unwrap();
    conn.execute(
        "UPDATE notes SET title = ?1, content = ?2 WHERE id = ?3",
        params![title, content, note_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// Delete a note
#[command]
fn delete_note(database: tauri::State<Database>, note_id: i32) -> Result<(), String> {
    let conn = database.conn.lock().unwrap();
    conn.execute("DELETE FROM notes WHERE id = ?1", params![note_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// Initialize database and Tauri app
fn main() {
    let database = Database::new().expect("Failed to initialize database");

    tauri::Builder::default()
        .manage(database)
        .invoke_handler(tauri::generate_handler![
            add_notebook,
            get_notebooks,
            delete_notebook,
            add_note,
            get_notes,
            update_note,
            delete_note
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
