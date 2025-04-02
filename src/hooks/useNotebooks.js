// src/hooks/useNotebooks.js
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [allNotes, setAllNotes] = useState([]); // stores full list
  const [notes, setNotes] = useState([]);       // filtered list for display
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAscending, setSortAscending] = useState(true);

  const fetchNotebooks = async () => {
    try {
      const data = await invoke("get_notebooks");
      setNotebooks(data);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
    }
  };

  const fetchNotes = async (notebookId, clearSelection = true) => {
    setSelectedNotebook(notebookId);
    if (clearSelection) {
      setSelectedNote(null);
    }
    try {
      const data = await invoke("get_notes", { notebookId });
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
      await invoke("create_notebook", { title });
      fetchNotebooks();
    } catch (error) {
      console.error("Error creating notebook:", error);
    }
  };

  const addNote = async (title) => {
    if (!selectedNotebook) return;
    try {
      await invoke("create_note", { notebookId: selectedNotebook, title });
      setShowCreateNoteModal(false);
      await fetchNotes(selectedNotebook);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const createEmptyNote = async () => {
    if (!selectedNotebook) return;
    try {
      const newNote = await invoke("create_note", { notebookId: selectedNotebook, title: "" });
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
      await invoke("update_note_title", { noteId, newTitle });
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
      await invoke("update_note_content", { noteId, newContent });
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

  const deleteNotebook = async (notebookId) => {
    try {
      await invoke("delete_notebook", { notebookId });
      setNotebooks((prev) => prev.filter((nb) => nb.id !== notebookId));
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
      await invoke("delete_note", { noteId });
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const updateNoteNotebook = async (noteId, newNotebookId) => {
    try {
      await invoke("update_note_notebook", { noteId, newNotebookId });
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
    sortAscending,
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
    fetchNotebooks,
    fetchNotes
  };
}
