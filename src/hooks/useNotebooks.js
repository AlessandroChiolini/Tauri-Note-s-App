// src/hooks/useNotebooks.js
import { useState, useEffect } from "react";
import {
  getNotebooks,
  createNotebook,
  getNotes,
  createNote,
  updateNoteContent as updateNoteContentAPI,
  updateNoteTitle as updateNoteTitleAPI,
  deleteNotebook as deleteNotebookAPI,
  deleteNote as deleteNoteAPI
} from "../services/api";

export function useNotebooks({ 
  // autres props
  updateTrashCounter,
}) {
  const [notebooks, setNotebooks] = useState([]);
  const [allNotes, setAllNotes] = useState([]); // stores the full list
  const [notes, setNotes] = useState([]);       // filtered list for display
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState(1); // 1 for ascending, -1 for descending

  const fetchNotebooks = async () => {
    try {
      const data = await getNotebooks();
      setNotebooks(data);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
    }
  };

  const fetchNotes = async (notebookId, clearSelection = true) => {
    if (clearSelection) {
      setSelectedNote(null);
    }
    
    try {
      const data = await getNotes(notebookId);
      setNotes(data);
      return data;
    } catch (error) {
      console.error("Error fetching notes:", error);
      return [];
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
      setShowCreateNoteModal(false);
      await fetchNotes(selectedNotebook);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  // Function to create an empty note
  const createEmptyNote = async () => {
    if (!selectedNotebook) return;
    try {
      const newNote = await createNote(selectedNotebook, "");
      setShowCreateNoteModal(false);
      await fetchNotes(selectedNotebook, false);
      setSelectedNote(newNote.id);
    } catch (error) {
      console.error("Error creating empty note:", error);
    }
  };

  const selectNote = (noteId) => {
    setSelectedNote(noteId);
  };

  const updateNoteTitle = async (noteId, newTitle) => {
    try {
      await updateNoteTitleAPI(noteId, newTitle);
      const currentTime = new Date().toISOString();
      setAllNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? { ...note, title: newTitle, updated_at: currentTime }
            : note
        )
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? { ...note, title: newTitle, updated_at: currentTime }
            : note
        )
      );
    } catch (error) {
      console.error("Error updating note title:", error);
    }
  };

  const updateNoteContent = async (noteId, newContent) => {
    try {
      await updateNoteContentAPI(noteId, newContent);
      const currentTime = new Date().toISOString();
      setAllNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? { ...note, content: newContent, updated_at: currentTime }
            : note
        )
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? { ...note, content: newContent, updated_at: currentTime }
            : note
        )
      );
    } catch (error) {
      console.error("Error updating note content:", error);
    }
  };

  // New delete function for a notebook
  const deleteNotebook = async (notebookId) => {
    try {
      await deleteNotebookAPI(notebookId);
      setNotebooks((prev) => prev.filter((nb) => nb.id !== notebookId));
      // If the deleted notebook was selected, clear its notes.
      if (selectedNotebook === notebookId) {
        setSelectedNotebook(null);
        setNotes([]);
        setAllNotes([]);
      }
    } catch (error) {
      console.error("Error deleting notebook:", error);
    }
  };

  const openCreateNoteModal = () => {
    setShowCreateNoteModal(true);
  };

  const closeCreateNoteModal = () => {
    setShowCreateNoteModal(false);
  };

  // General sorting function that can sort by different fields
  const sortNotes = (sortBy = 'title') => {
    if (sortBy === 'title') {
      sortNotesByTitle();
    } else if (sortBy === 'created_at' || sortBy === 'updated_at') {
      sortNotesByDate(sortBy);
    }
  };

  const sortNotesByTitle = () => {
    const sortedNotes = [...notes].sort((a, b) => {
      const titleA = (a.title || "").toLowerCase();
      const titleB = (b.title || "").toLowerCase();
      return sortDirection * titleA.localeCompare(titleB);
    });
    setNotes(sortedNotes);
    setSortDirection(sortDirection * -1);
  };

  const sortNotesByDate = (dateField) => {
    const sortedNotes = [...notes].sort((a, b) => {
      const dateA = new Date(a[dateField]);
      const dateB = new Date(b[dateField]);
      return sortDirection * (dateB - dateA);
    });
    setNotes(sortedNotes);
    setSortDirection(sortDirection * -1);
  };

  const searchNotes = (query) => {
    setSearchQuery(query);
    if (!query) {
      setNotes(allNotes);
    } else {
      const filtered = allNotes.filter((note) =>
        note.title.toLowerCase().includes(query.toLowerCase())
      );
      setNotes(filtered);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const deleteNote = async (noteId) => {
    try {
      // Appeler l'API pour supprimer la note
      await deleteNoteAPI(noteId);
      
      // Mettre à jour l'état local des notes visibles
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      
      // Mettre à jour également le tableau complet des notes
      setAllNotes((prevAllNotes) => prevAllNotes.filter((note) => note.id !== noteId));
      
      // Si la note supprimée était sélectionnée, effacer la sélection
      if (selectedNote === noteId) {
        setSelectedNote(null);
      }
      
      // Mettre à jour le compteur de la corbeille pour déclencher un rafraîchissement
      updateTrashCounter();
      
      console.log(`Note ${noteId} supprimée avec succès`);
    } catch (error) {
      console.error("Erreur lors de la suppression de la note:", error);
    }
  };

  // Optional: If you want to update a note's notebook, add this functionality.
  const updateNoteNotebook = async (noteId, newNotebookId) => {
    try {
      // Uncomment and adjust if you have an API endpoint for updating note's notebook.
      // await updateNoteNotebookAPI(noteId, newNotebookId);
      setAllNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...note, notebook: newNotebookId } : note
        )
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...note, notebook: newNotebookId } : note
        )
      );
    } catch (error) {
      console.error("Error updating note notebook:", error);
    }
  };

  const selectNotebook = (notebookId) => {
    setSelectedNotebook(notebookId);
    fetchNotes(notebookId);
  };

  return {
    notebooks,
    allNotes,
    notes,
    selectedNotebook,
    selectedNote,
    showCreateNoteModal,
    searchQuery,
    sortDirection,
    selectNotebook,
    selectNote,
    addNotebook,
    addNote,
    createEmptyNote,
    updateNoteContent,
    updateNoteTitle,
    updateNoteNotebook,
    deleteNotebook,
    openCreateNoteModal,
    closeCreateNoteModal,
    sortNotes,
    searchNotes,
    deleteNote,
    sortNotesByTitle,
    sortNotesByDate,
    fetchNotes
  };
}
