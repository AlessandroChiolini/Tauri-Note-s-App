// src/contexts/AppContext.jsx
import { createContext, useContext } from "react";
import { useNotebooks } from "../hooks/useNotebooks";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // useNotebooks now returns notebooks, notes, updateNoteNotebook, selectNotebook, etc.
  // This makes the updateNoteNotebook (for drag and drop) available in the context.
  const notebooksData = useNotebooks();
  return (
    <AppContext.Provider value={notebooksData}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);