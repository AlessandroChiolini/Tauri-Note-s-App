// src/services/api.js
import { invoke } from "@tauri-apps/api/core";

export const initializeDB = () => invoke("initialize_db");
export const getNotebooks = () => invoke("get_notebooks");
export const createNotebook = (title) => invoke("create_notebook", { title });
export const getNotes = (notebookId) => invoke("get_notes", { notebookId });
export const createNote = (notebookId, title) =>
  invoke("create_note", { notebookId, title });
export const updateNoteContent = (noteId, newContent) =>
  invoke("update_note_content", { noteId, newContent });
export const updateNoteTitle = (noteId, newTitle) =>
  invoke("update_note_title", { noteId, newTitle });
export const deleteNote = (noteId) => invoke("delete_note", { noteId });
