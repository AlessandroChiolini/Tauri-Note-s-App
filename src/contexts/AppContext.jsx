// src/contexts/AppContext.jsx
import { createContext, useContext } from "react";
import { useNotebooks } from "../hooks/useNotebooks";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const notebooksData = useNotebooks();

  return (
    <AppContext.Provider value={{ ...notebooksData }}>
      {children}
    </AppContext.Provider>
  );
};

const deleteNote = async (noteId) => {
  try {
    // Call the backend to mark the note as deleted (soft delete)
    await invoke("delete_note", { noteId });
    
    // Remove the note from the current notes list in the UI
    setNotes(notes.filter(note => note.id !== noteId));
  } catch (error) {
    console.error("Failed to delete note:", error);
  }
};

export const useAppContext = () => useContext(AppContext);
