// src/hooks/useNotebooks.js
import { useState, useEffect } from "react";
import {
  getNotebooks,
  createNotebook,
  getNotes,
  createNote,
  updateNoteContent as updateNoteContentAPI,
  updateNoteTitle as updateNoteTitleAPI,
} from "../services/api";

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [allNotes, setAllNotes] = useState([]); // stores the full list
  const [notes, setNotes] = useState([]);       // filtered list for display
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAscending, setSortAscending] = useState(true);

  const fetchNotebooks = async () => {
    try {
      const data = await getNotebooks();
      setNotebooks(data);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
    }
  };

  // Modified fetchNotes accepts an optional parameter 'clearSelection'
  const fetchNotes = async (notebookId, clearSelection = true) => {
    setSelectedNotebook(notebookId);
    if (clearSelection) {
      setSelectedNote(null);
    }
    try {
      const data = await getNotes(notebookId);
      setAllNotes(data);
      if (searchQuery) {
        setNotes(
          data.filter((note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else {
        setNotes(data);
      }
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

  // addNote is used for creating a note when a title is already provided
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

  // New function: createEmptyNote creates a note with an empty title,
  // then re-fetches notes without clearing the selection, and finally selects the new note.
  const createEmptyNote = async () => {
    if (!selectedNotebook) return;
    try {
      const newNote = await createNote(selectedNotebook, "");
      setShowCreateNoteModal(false);
      // fetch notes without clearing the selected note
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
      setAllNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...note, title: newTitle } : note
        )
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...note, title: newTitle } : note
        )
      );
    } catch (error) {
      console.error("Error updating note title:", error);
    }
  };

  const updateNoteContent = async (noteId, newContent) => {
    try {
      await updateNoteContentAPI(noteId, newContent);
      setAllNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...note, content: newContent } : note
        )
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...note, content: newContent } : note
        )
      );
    } catch (error) {
      console.error("Error updating note content:", error);
    }
  };

  // Modal control for creating a note (if needed)
  const openCreateNoteModal = () => {
    setShowCreateNoteModal(true);
  };

  const closeCreateNoteModal = () => {
    setShowCreateNoteModal(false);
  };

  // Sorting notes by title (toggling order)
  const sortNotes = () => {
    const sortedNotes = [...notes].sort((a, b) => {
      if (sortAscending) {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
    setNotes(sortedNotes);
    setSortAscending(!sortAscending);
  };

  // Search notes by title using the allNotes list
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

  return {
    notebooks,
    notes,
    selectedNotebook,
    selectedNote,
    showCreateNoteModal,
    selectNotebook: fetchNotes,
    selectNote,
    addNotebook,
    addNote,
    createEmptyNote, // added here
    updateNoteContent,
    updateNoteTitle,
    openCreateNoteModal,
    closeCreateNoteModal,
    sortNotes,
    searchNotes,
  };
}
