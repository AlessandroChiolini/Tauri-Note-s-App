# Tauri Backend Documentation

This document provides an overview of the Tauri backend implemented in Rust. It covers the following sections:

# 1. Data Structures
# 2. Database Connection
# 3. Commands
# 4. Application Setup and Main Function

Each section includes code samples from the main.rs file.

# 1. Data Structures

The backend defines several serializable data structures used to represent the core entities of the application.

## 1.1 Notebook

```rust
#[derive(Serialize)]
struct Notebook {
    id: String,
    title: String,
}
```

## 1.2 Note

```rust
#[derive(Serialize)]
struct Note {
    id: String,
    notebook_id: String,
    title: String,
    content: String,
    created_at: String,
    updated_at: String,
}
```

## 1.3 Image

```rust
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
```

# 2. Database connection

The establish_connection function sets up a connection to the SQLite database using the URL defined in the environment (.env) file and returns either a connection or an error message.

```rust
fn establish_connection() -> Result<Connection, String> {
    dotenv().ok(); // Load environment variables

    let database_url = env::var("DATABASE_URL")
        .map_err(|_| "DATABASE_URL must be defined in the .env file".to_string())?;

    Connection::open(database_url).map_err(|e| e.to_string())
}
```

# 3. Commands

The backend exposes several commands via the Tauri #[command] attribute which are invoked from the frontend. Below are code samples for key commands.

## 3.1 Creating a Notebook

```rust
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
```

## 3.2 Creating a Note

```rust
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
```

## 3.3 Retrieving Notebooks

```rust
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
```

## 3.4 Retrieving Notes for a Notebook

```rust
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
```

## 3.5 Updating Note Content

```rust
#[command]
fn update_note_content(note_id: String, new_content: String) -> Result<(), String> {
    println!("Updating note content, length: {}", new_content.len());
    let conn = establish_connection()?;

    let affected_rows = conn.execute(
        "UPDATE notes SET content = ?, updated_at = datetime('now') WHERE id = ?",
        (&new_content, &note_id),
    )
    .map_err(|e| e.to_string())?;

    if affected_rows == 0 {
        Err(format!("No note found with id: {}", note_id))
    } else {
        Ok(())
    }
}
```

## 3.6 Updating Note Title

```rust
#[command]
fn update_note_title(note_id: String, new_title: String) -> Result<(), String> {
    let conn = establish_connection()?;

    let affected_rows = conn.execute(
        "UPDATE notes SET title = ?, updated_at = datetime('now') WHERE id = ?",
        (&new_title, &note_id),
    )
    .map_err(|e| e.to_string())?;

    if affected_rows == 0 {
        Err(format!("No note found with id: {}", note_id))
    } else {
        Ok(())
    }
}
```

## 3.7 Updating Note's Notebook

```rust
#[command]
fn update_note_notebook(note_id: String, new_notebook_id: String) -> Result<(), String> {
    let conn = establish_connection()?;

    // Verify that the destination notebook exists.
    let mut stmt = conn.prepare("SELECT id FROM notebooks WHERE id = ?")
        .map_err(|e| e.to_string())?;
    let exists = stmt.exists([new_notebook_id.clone()]).map_err(|e| e.to_string())?;
    if !exists {
        return Err(format!("No notebook found with id: {}", new_notebook_id));
    }

    let affected_rows = conn.execute(
        "UPDATE notes SET notebook_id = ?, updated_at = datetime('now') WHERE id = ?",
        (&new_notebook_id, &note_id),
    )
    .map_err(|e| e.to_string())?;
    if affected_rows == 0 {
        Err(format!("No note found with id: {}", note_id))
    } else {
        Ok(())
    }
}
```

## 3.8 Soft Deleting a Note

```rust
#[command]
fn delete_note(note_id: String) -> Result<(), String> {
    let conn = establish_connection()?;
    let affected_rows = conn.execute(
        "UPDATE notes SET deleted = TRUE WHERE id = ?",
        [&note_id],
    )
    .map_err(|e| e.to_string())?;
    if affected_rows == 0 {
        Err(format!("No note found with id: {}", note_id))
    } else {
        Ok(())
    }
}
```

## 3.9 Permanently Deleting a Note

```rust
#[command]
fn permanently_delete_note(note_id: String) -> Result<(), String> {
    let conn = establish_connection()?;
    let affected_rows = conn.execute(
        "DELETE FROM notes WHERE id = ?",
        [&note_id],
    )
    .map_err(|e| e.to_string())?;
    if affected_rows == 0 {
        Err(format!("No note found with id: {}", note_id))
    } else {
        Ok(())
    }
}
```

## 3.10 Restoring a Deleted Note

```rust
#[command]
fn restore_note(note_id: String) -> Result<(), String> {
    let conn = establish_connection()?;
    let affected_rows = conn.execute(
        "UPDATE notes SET deleted = FALSE WHERE id = ?",
        [&note_id],
    )
    .map_err(|e| e.to_string())?;
    if affected_rows == 0 {
        Err(format!("No note found with id: {}", note_id))
    } else {
        Ok(())
    }
}
```

## 3.11 Deleting a Notebook

```rust
#[command]
fn delete_notebook(notebook_id: String) -> Result<(), String> {
    let conn = establish_connection()?;
    let affected_rows = conn.execute(
        "DELETE FROM notebooks WHERE id = ?",
        [&notebook_id],
    )
    .map_err(|e| e.to_string())?;
    if affected_rows == 0 {
        Err(format!("No notebook found with id: {}", notebook_id))
    } else {
        Ok(())
    }
}
```

## 3.12 Initializing the Database

```rust
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
```

## 3.13 Saving an Image

```rust
#[command]
fn save_image(
    note_id: String,
    image_data: Vec<u8>,
    filename: String,
    mime_type: String,
) -> Result<Image, String> {
    println!(
        "Rust: save_image called for '{}', size: {} bytes",
        filename,
        image_data.len()
    );
    
    let conn = establish_connection()?;

    // Ensure the 'images' table exists
    let table_check = conn.query_row(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='images'",
        [],
        |row| row.get::<_, String>(0),
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
        )
        .map_err(|e| format!("Failed to create images table: {}", e.to_string()))?;
    }
    
    // Validate image size (max 2MB)
    const MAX_SIZE: usize = 2 * 1024 * 1024;
    if image_data.len() > MAX_SIZE {
        return Err("Image is too large (max 2MB)".to_string());
    }
    
    let image_id = Uuid::new_v4().to_string();
    match conn.execute(
        "INSERT INTO images (id, note_id, image_data, filename, mime_type, size) VALUES (?, ?, ?, ?, ?, ?)",
        (&image_id, &note_id, &image_data, &filename, &mime_type, image_data.len() as i64),
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
```

## 3.14 Retrieving Image Metadata

```rust
#[command]
fn get_image_metadata(image_id: String) -> Result<Image, String> {
    let conn = establish_connection()?;
    let mut stmt = conn
        .prepare("SELECT id, note_id, filename, mime_type, size, created_at FROM images WHERE id = ?")
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
        Err(format!("Image with ID {} not found", image_id))
    }
}
```

## 3.15 Retrieving Image Data

```rust
#[command]
fn get_image(image_id: String) -> Result<Vec<u8>, String> {
    println!("Rust: get_image({}) called", image_id);
    let conn = establish_connection()?;
    let query_result = conn.query_row(
        "SELECT image_data FROM images WHERE id = ?",
        [&image_id],
        |row| row.get::<_, Vec<u8>>(0),
    );

    match query_result {
        Ok(image_data) => {
            println!("Rust: Found image {} with {} bytes", image_id, image_data.len());
            Ok(image_data)
        }
        Err(e) => {
            println!("Rust: Error retrieving image {}: {}", image_id, e);
            Err(format!("Error retrieving image {}: {}", image_id, e))
        }
    }
}
```

# 4. Application Setup and Main Function

The main function sets up and runs the Tauri application. It uses a builder to configure the Tauri environment, registers all commands using an invoke handler, and starts the application.

```rust
fn main() {
    dotenv().ok();

    tauri::Builder::default()
        // MENU BAR (if applicable)
        .setup(|_app| {
            // Simplified menu setup (adjust based on your Tauri version)
            Ok(())
        })
        // Register all commands so they can be invoked from the frontend
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
            restore_note,
            save_image,
            get_image,
            get_image_metadata
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

This documentation, along with these code samples, should provide developers with a clear understanding of the Rust backend architecture, how data is structured and stored, how commands operate, and how the Tauri application is set up and run.