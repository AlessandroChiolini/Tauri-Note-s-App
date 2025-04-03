use dotenv::dotenv;
use rusqlite::{Connection, Result};
use serde::Serialize;
use std::env;
use tauri::command;
use chrono;
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

#[derive(Debug, serde::Serialize)]
#[allow(dead_code)]
struct Image {
    id: String,
    note_id: String,
    filename: String,
    mime_type: String,
    size: i64,
    created_at: String,
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
fn get_notes(notebook_id: String, _sort_by: Option<String>) -> Result<Vec<Note>, String> {
    let conn = establish_connection()?;

    let query = "SELECT id, notebook_id, title, content, created_at, updated_at 
                 FROM notes 
                 WHERE notebook_id = ? AND deleted = FALSE 
                 ORDER BY title COLLATE NOCASE";

    let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

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
    println!("Updating note content, length: {}", new_content.len());
    
    // Log pour déboguer si la chaîne contient des références d'images
    if new_content.contains("image://") {
        println!("Content contains image references");
    }
    
    let conn = establish_connection()?;

    let affected_rows = conn
        .execute(
            "UPDATE notes SET content = ?, updated_at = datetime('now') WHERE id = ?",
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
            "UPDATE notes SET title = ?, updated_at = datetime('now') WHERE id = ?",
            (&new_title, &note_id),
        )
        .map_err(|e| e.to_string())?;

    if affected_rows == 0 {
        Err(format!("Aucune note trouvée avec l'id : {}", note_id))
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

#[command]
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

        CREATE TABLE IF NOT EXISTS images (
            id TEXT PRIMARY KEY,
            note_id TEXT NOT NULL,
            image_data BLOB NOT NULL,
            filename TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            size INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
        );
        ",
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
fn save_image(note_id: String, image_data: Vec<u8>, filename: String, mime_type: String) -> Result<Image, String> {
    println!("Rust: save_image called for '{}', size: {} bytes", filename, image_data.len());
    
    // Vérifier que la table images existe
    let conn = establish_connection()?;
    
    // Vérifier que la table existe
    let table_check = conn.query_row(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='images'",
        [],
        |row| row.get::<_, String>(0)
    );
    
    if table_check.is_err() {
        println!("Table 'images' not found, creating it...");
        conn.execute(
            "CREATE TABLE IF NOT EXISTS images (
                id TEXT PRIMARY KEY,
                note_id TEXT NOT NULL,
                image_data BLOB NOT NULL,
                filename TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                size INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
            )",
            [],
        ).map_err(|e| format!("Failed to create images table: {}", e.to_string()))?;
    }
    
    // Vérification de la taille
    const MAX_SIZE: usize = 2 * 1024 * 1024;
    if image_data.len() > MAX_SIZE {
        return Err("L'image est trop volumineuse (max 2Mo)".to_string());
    }

    // Générer un ID unique
    let image_id = Uuid::new_v4().to_string();
    
    // Insérer l'image avec gestion d'erreur détaillée
    match conn.execute(
        "INSERT INTO images (id, note_id, image_data, filename, mime_type, size) VALUES (?, ?, ?, ?, ?, ?)",
        (
            &image_id,
            &note_id,
            &image_data,
            &filename,
            &mime_type,
            image_data.len() as i64,
        ),
    ) {
        Ok(_) => {
            println!("Image saved successfully with ID: {}", image_id);
            let current_time = chrono::Local::now().naive_local().to_string();
            Ok(Image {
                id: image_id,
                note_id,
                filename,
                mime_type,
                size: image_data.len() as i64,
                created_at: current_time,
            })
        },
        Err(e) => {
            println!("Error saving image: {}", e);
            Err(format!("Failed to save image: {}", e))
        }
    }
}

#[command]
fn get_image_metadata(image_id: String) -> Result<Image, String> {
    let conn = establish_connection()?;
    
    let mut stmt = conn.prepare("SELECT id, note_id, filename, mime_type, size, created_at FROM images WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let mut rows = stmt.query([&image_id]).map_err(|e| e.to_string())?;
    
    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let image = Image {
            id: row.get(0).map_err(|e| e.to_string())?,
            note_id: row.get(1).map_err(|e| e.to_string())?,
            filename: row.get(2).map_err(|e| e.to_string())?,
            mime_type: row.get(3).map_err(|e| e.to_string())?,
            size: row.get(4).map_err(|e| e.to_string())?,
            created_at: row.get(5).map_err(|e| e.to_string())?,
        };
        Ok(image)
    } else {
        Err(format!("Image avec l'ID {} non trouvée", image_id))
    }
}

#[command]
fn get_image(image_id: String) -> Result<Vec<u8>, String> {
    println!("Rust: get_image({}) appelé", image_id);
    
    let conn = establish_connection()?;
    
    // Vérification plus simple mais efficace
    let query_result = conn.query_row(
        "SELECT image_data FROM images WHERE id = ?",
        [&image_id],
        |row| row.get::<_, Vec<u8>>(0)
    );
    
    match query_result {
        Ok(image_data) => {
            println!("Rust: Image {} trouvée, taille: {} octets", image_id, image_data.len());
            Ok(image_data)
        },
        Err(e) => {
            println!("Rust: Erreur lors de la récupération de l'image {}: {}", image_id, e);
            Err(format!("Erreur lors de la récupération de l'image {}: {}", image_id, e))
        }
    }
}

// ======================
// 3. The main function
// ======================

fn main() {
    dotenv().ok();

    tauri::Builder::default()
        //MENU BAR 
        .setup(|_app| {
            // Simplified menu setup for Tauri v1
            // If you're using Tauri v2, the syntax would be different
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
            delete_note,
            get_deleted_notes,
            permanently_delete_note,
            delete_notebook,
            restore_note,
            save_image,
            get_image,
            get_image_metadata
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
