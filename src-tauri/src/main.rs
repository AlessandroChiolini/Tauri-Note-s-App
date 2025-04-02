use dotenv::dotenv;
use rusqlite::{Connection, Result};
use serde::Serialize;
use std::env;
use tauri::command;
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use uuid::Uuid;

// ======================
// 1. Data Structures
// ======================
// ======== STRUCTURES ==========
#[derive(Serialize)]
struct Notebook {
    id: String,
    title: String,
}

#[derive(Serialize)]
struct Note {
    id: String,
    notebook_id: String,
    title: String,
    content: String,
    created_at: String,
    updated_at: String,
}

// ======================
// 2. Commands
// ======================

// ======== FONCTION POUR CONNEXION DB ========
fn establish_connection() -> Result<Connection, String> {
    dotenv().ok(); // Charge automatiquement les variables d'environnement

    let database_url = env::var("DATABASE_URL")
        .map_err(|_| "DATABASE_URL doit être définie dans le fichier .env".to_string())?;

    Connection::open(database_url).map_err(|e| e.to_string())
}

#[command]
fn create_notebook(title: String) -> Result<Notebook, String> {
    let conn = establish_connection()?;
    let id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO notebooks (id, title) VALUES (?, ?)",
        (&id, &title),
    )
    .map_err(|e| e.to_string())?;

    Ok(Notebook { id, title })
}

#[command]
fn create_note(notebook_id: String, title: String) -> Result<Note, String> {
    let conn = establish_connection()?;
    let id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO notes (id, notebook_id, title, content) VALUES (?, ?, ?, ?)",
        (&id, &notebook_id, &title, ""),
    )
    .map_err(|e| e.to_string())?;

    Ok(Note {
        id,
        notebook_id,
        title,
        content: String::new(),
        created_at: String::new(),
        updated_at: String::new(),
    })
}

/// Fetch all notebooks from the `notebooks` table.
#[command]
fn get_notebooks() -> Result<Vec<Notebook>, String> {
    let conn = establish_connection()?;

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

    Ok(notebooks)
}

/// Fetch notes for a specific notebook.
#[command]
fn get_notes(notebook_id: String) -> Result<Vec<Note>, String> {
    let conn = establish_connection()?;

    let mut stmt = conn
        .prepare("SELECT id, notebook_id, title, content, created_at, updated_at FROM notes WHERE notebook_id = ? AND deleted = FALSE")
        .map_err(|e| e.to_string())?;

    let notes_iter = stmt
        .query_map([notebook_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                notebook_id: row.get(1)?,
                title: row.get(2)?,
                content: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let notes: Vec<Note> = notes_iter.filter_map(Result::ok).collect();

    Ok(notes)
}

#[command]
fn update_note_content(note_id: String, new_content: String) -> Result<(), String> {
    let conn = establish_connection()?;

    let affected_rows = conn
        .execute(
            "UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (&new_content, &note_id),
        )
        .map_err(|e| e.to_string())?;

    if affected_rows == 0 {
        Err(format!("Aucune note trouvée avec l'id : {}", note_id))
    } else {
        Ok(())
    }
}

#[command]
fn update_note_title(note_id: String, new_title: String) -> Result<(), String> {
    let conn = establish_connection()?;
    let affected_rows = conn
        .execute(
            "UPDATE notes SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (&new_title, &note_id),
        )
        .map_err(|e| e.to_string())?;
    if affected_rows == 0 {
        Err(format!("Aucune note trouvée avec l'id : {}", note_id))
    } else {
        Ok(())
    }
}

#[command]
fn update_note_notebook(note_id: String, new_notebook_id: String) -> Result<(), String> {
    let conn = establish_connection()?;
    let affected_rows = conn
        .execute(
            "UPDATE notes SET notebook_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (&new_notebook_id, &note_id),
        )
        .map_err(|e| e.to_string())?;
    if affected_rows == 0 {
        Err(format!("No note found with id: {}", note_id))
    } else {
        Ok(())
    }
}

#[command] //Mettre une note à la corbeille
fn delete_note(note_id: String) -> Result<(), String> {
    println!("HEA");
    let conn = establish_connection()?;
    let affected_rows = conn
        .execute("UPDATE notes SET deleted = TRUE WHERE id = ?", [&note_id])
        .map_err(|e| e.to_string())?;
    if affected_rows == 0 {
        Err(format!("No note found with id: {}", note_id))
    } else {
        Ok(())
    }
}

#[command] // Supprimer les éléments de la corbeille
fn permanently_delete_note(note_id: String) -> Result<(), String> {
    let conn = establish_connection()?;
    let affected_rows = conn
        .execute("DELETE FROM notes WHERE id = ?", [&note_id])
        .map_err(|e| e.to_string())?;
    if affected_rows == 0 {
        Err(format!("No note found with id: {}", note_id))
    } else {
        Ok(())
    }
}

#[command] // Afficher les notes supprimées
fn get_deleted_notes() -> Result<Vec<Note>, String> {
    let conn = establish_connection()?;

    let mut stmt = conn
        .prepare("SELECT id, notebook_id, title, content, created_at, updated_at FROM notes WHERE deleted = TRUE")
        .map_err(|e| e.to_string())?;

    let notes_iter = stmt
        .query_map([], |row| {
            Ok(Note {
                id: row.get(0)?,
                notebook_id: row.get(1)?,
                title: row.get(2)?,
                content: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let notes: Vec<Note> = notes_iter.filter_map(Result::ok).collect();

    Ok(notes)
}

#[command]
fn restore_note(note_id: String) -> Result<(), String> {
    let conn = establish_connection()?;
    let affected_rows = conn
        .execute("UPDATE notes SET deleted = FALSE WHERE id = ?", [&note_id])
        .map_err(|e| e.to_string())?;
    if affected_rows == 0 {
        Err(format!("No note found with id: {}", note_id))
    } else {
        Ok(())
    }
}

#[command]
fn delete_notebook(notebook_id: String) -> Result<(), String> {
    let conn = establish_connection()?;
    let affected_rows = conn
        .execute("DELETE FROM notebooks WHERE id = ?", [&notebook_id])
        .map_err(|e| e.to_string())?;
    if affected_rows == 0 {
        Err(format!("No notebook found with id: {}", notebook_id))
    } else {
        Ok(())
    }
}

#[tauri::command]
fn initialize_db() -> Result<(), String> {
    let conn = establish_connection()?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS notebooks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            notebook_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            deleted BOOLEAN DEFAULT FALSE,
            FOREIGN KEY(notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE
        );
        ",
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

// ======================
// 3. The main function
// ======================

fn main() {
    dotenv().ok();

    tauri::Builder::default()
        //MENU BAR Tauri v2: https://v2.tauri.app/learn/window-menu/
        .setup(|app| {
            let menu = MenuBuilder::new(app)
                .items(&[
                    &SubmenuBuilder::new(app, "File").quit().build()?,
                    &SubmenuBuilder::new(app, "Edit")
                        .undo()
                        .redo()
                        .separator()
                        .copy()
                        .paste()
                        .cut()
                        .select_all()
                        .separator()
                        .build()?,
                    &SubmenuBuilder::new(app, "View")
                        .text("settings", "Preferences")
                        .build()?,
                    &SubmenuBuilder::new(app, "Window")
                        .minimize()
                        .maximize()
                        .build()?,
                    &SubmenuBuilder::new(app, "Help")
                        .text("source", "Github")
                        .build()?,
                ])
                .build()?;
            app.handle().set_menu(menu)?;

            app.on_menu_event(move |_app_handle: &tauri::AppHandle, event| {
                println!("menu event: {:?}", event.id());

                match event.id().0.as_str() {
                    "settings" => {
                        println!("custom events");
                    }
                    "source" => {
                        println!("custom events");
                    }
                    _ => {
                        println!("unexpected menu event");
                    }
                }
            });
            Ok(())
        })
        // INVOKE HANDLER
        .invoke_handler(tauri::generate_handler![
            initialize_db,
            create_notebook,
            create_note,
            get_notebooks,
            get_notes,
            update_note_content,
            update_note_title,
            update_note_notebook,
            delete_note,
            get_deleted_notes,
            permanently_delete_note,
            delete_notebook,
            restore_note // Add this line
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
