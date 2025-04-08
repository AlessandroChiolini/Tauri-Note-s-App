# API Service Documentation

The api.js file encapsulates all interactions with the backend using Tauri’s invoke function. This file exports several functions that serve as an abstraction layer for:

# 1. Initializing the database
# 2. CRUD operations on notebooks 
# 3. CRUD operations on notes
# 4. Image saving and retrieval

Each function sends a message (and any required parameters) to a corresponding Rust command handled by Tauri.

Exported Functions

# 1. Database Initialization

## 1.1 initializeDB

Invokes the initialize_db command to set up the database.

```javascript
export const initializeDB = () => invoke("initialize_db");
```

# 2. Notebooks Operations

## 2.1 getNotebooks

Retrieves the list of notebooks.

```javascript
export const getNotebooks = () => invoke("get_notebooks");
```
## 2.2 createNotebook

Creates a new notebook by sending the notebook title.

```javascript
export const createNotebook = (title) => invoke("create_notebook", { title });
```

## 2.3 deleteNotebook

Deletes a notebook by its ID.

```javascript
export const deleteNotebook = (notebookId) => invoke("delete_notebook", { notebookId });
```

# 3. Notes Operations

## 3.1 getNotes

Retrieves the notes for a given notebook.

```javascript
export const getNotes = (notebookId) => invoke("get_notes", { notebookId });
```

## 3.2 createNote

Creates a new note within a notebook using the notebookId and the note title.

```javascript
export const createNote = (notebookId, title) => invoke("create_note", { notebookId, title });
```

## 3.3 updateNoteContent

Updates the content of a specific note by sending the note ID and new content.

```javascript
export const updateNoteContent = (noteId, newContent) => invoke("update_note_content", { noteId, newContent });
```

## 3.4 updateNoteTitle

Updates the title of a note.

```javascript
export const updateNoteTitle = (noteId, newTitle) => invoke("update_note_title", { noteId, newTitle });
```

## 3.5 deleteNote

Deletes a note by its ID.

```javascript
export const deleteNote = (noteId) => invoke("delete_note", { noteId });
```

# 4. Image Handling

## 4.1 saveImage:

Uploads an image associated with a note. It sends the note ID, image data (as an array), filename, MIME type, and the image size. The function then extracts and returns the generated image ID from the backend.

```javascript
export const saveImage = async (noteId, imageData, filename, mimeType) => {
  try {
    console.log(`API: saveImage called for ${filename}, size: ${imageData.length} bytes`);
    
    const result = await invoke("save_image", { 
      noteId, 
      imageData, 
      filename, 
      mimeType,
      size: imageData.length
    });
    
    console.log(`API: Result from save_image: ${JSON.stringify(result)}`);
    // Extract the image ID from the returned object
    const imageId = (typeof result === "object" && result !== null) ? result.id : result;
    
    console.log(`API: Image saved with ID: ${imageId}`);
    return imageId;
  } catch (error) {
    console.error("Error saving image:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    throw error;
  }
};
```
## 4.2 getImage

Retrieves image data by its image ID. The function handles various possible formats of the returned image data and converts it to a Uint8Array.

```javascript
export const getImage = async (imageId) => {
  try {
    console.log(`📡 Appel API: getImage(${imageId})`);
    if (!imageId) {
      console.error("⚠️ ID d'image manquant");
      return null;
    }
    const result = await invoke("get_image", { imageId });
    if (!result) {
      console.warn(`⚠️ Aucune donnée reçue pour l'image ${imageId}`);
      return null;
    }
    console.log(`📊 Type de données reçues: ${typeof result}, est un tableau: ${Array.isArray(result)}, longueur: ${Array.isArray(result) ? result.length : 'N/A'}`);
    if (Array.isArray(result)) {
      return new Uint8Array(result);
    } else if (result instanceof Uint8Array) {
      return result;
    } else if (typeof result === "object" && result.type === "Buffer") {
      return new Uint8Array(result.data);
    }
    console.warn(`⚠️ Format non reconnu pour l'image ${imageId}`);
    return null;
  } catch (error) {
    console.error(`❌ Erreur API getImage(${imageId}):`, error);
    return null;
  }
};
```

This file consolidates all API calls via Tauri's invoke function, making it easier to manage data operations and image handling. By centralizing these operations, any changes to the backend interface require modifications in just one place—improving maintainability across the application.

This documentation should help developers understand how the application communicates with the backend and manages actions such as CRUD operations and image processing.