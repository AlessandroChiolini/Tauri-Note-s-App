// src/services/api.js
import { invoke } from "@tauri-apps/api/core";

export const initializeDB = () => invoke("initialize_db");
export const getNotebooks = () => invoke("get_notebooks");
export const createNotebook = (title) => invoke("create_notebook", { title });
export const deleteNotebook = (notebookId) => invoke("delete_notebook", { notebookId });

export const getNotes = (notebookId) => invoke("get_notes", { notebookId });
export const createNote = (notebookId, title) => invoke("create_note", { notebookId, title });
export const updateNoteContent = (noteId, newContent) => invoke("update_note_content", { noteId, newContent });
export const updateNoteTitle = (noteId, newTitle) => invoke("update_note_title", { noteId, newTitle });
export const deleteNote = (noteId) => invoke("delete_note", { noteId });

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
