// src/contexts/AppContext.jsx
import React, { createContext, useContext, useMemo, useCallback } from "react";
import PropTypes from 'prop-types';
import { useNotebooks } from "../hooks/useNotebooks";
import { invoke } from "@tauri-apps/api/core";
import { saveImage as saveImageAPI } from "../services/api";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // useNotebooks now returns notebooks, notes, updateNoteNotebook, selectNotebook, etc.
  const notebooksData = useNotebooks();

  // Add deleteNote function to the context
  const deleteNote = useCallback(async (noteId) => {
    try {
      // Call the backend to mark the note as deleted (soft delete)
      await invoke("delete_note", { noteId });
      
      // Remove the note from the current notes list in the UI
      const { notes, setNotes } = notebooksData;
      if (notes && setNotes) {
        setNotes(notes.filter(note => note.id !== noteId));
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  }, [notebooksData]);

  // Add saveImage function to the context
  const saveImage = useCallback(async (noteId, imageData, filename, mimeType) => {
    console.log("Saving image:", { noteId, size: imageData.length, filename, type: mimeType });
    try {
      const imageId = await saveImageAPI(noteId, imageData, filename, mimeType);
      console.log("Image saved successfully:", imageId);
      return imageId;
    } catch (error) {
      console.error("Failed to save image:", error);
      throw error;
    }
  }, []);

  // Combine all the functionality from notebooksData along with deleteNote and saveImage
  const contextValue = useMemo(() => {
    return { 
      ...notebooksData,
      deleteNote,
      saveImage,
    };
  }, [notebooksData, deleteNote, saveImage]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAppContext = () => useContext(AppContext);
