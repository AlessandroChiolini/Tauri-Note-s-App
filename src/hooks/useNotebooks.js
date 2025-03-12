// src/hooks/useNotebooks.js
import { useState, useEffect } from "react";
import { getNotebooks, createNotebook, getNotes, createNote, updateNoteContent as updateNoteContentAPI } from "../services/api";

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchNotebooks = async () => {
    try {
      const data = await getNotebooks();
      setNotebooks(data);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
    }
  };

  const selectNotebook = async (notebookId) => {
    setSelectedNotebook(notebookId);
    setSelectedNote(null);
    try {
      const data = await getNotes(notebookId);
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const addNotebook = async (title) => {
    try {
      await createNotebook(title);
      fetchNotebooks();
    } catch (error) {
      console.error("Error creating notebook:", error);
    }
  };

  const addNote = async (title) => {
    if (!selectedNotebook) return;
    try {
      await createNote(selectedNotebook, title);
      // Après création, on recharge les notes du notebook sélectionné
      selectNotebook(selectedNotebook);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const selectNote = (noteId) => {
    setSelectedNote(noteId);
  };

  const updateNoteContent = async (noteId, newContent) => {
    try {
      await updateNoteContentAPI(noteId, newContent);
      // Après la mise à jour, on peut rafraîchir la liste des notes
      if (selectedNotebook) {
        const updatedNotes = await getNotes(selectedNotebook);
        setNotes(updatedNotes);
      }
    } catch (error) {
      console.error("Error updating note content:", error);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  return {
    notebooks,
    notes,
    selectedNotebook,
    selectedNote,
    selectNotebook,
    selectNote,
    addNotebook,
    addNote,
    updateNoteContent,
  };
}
