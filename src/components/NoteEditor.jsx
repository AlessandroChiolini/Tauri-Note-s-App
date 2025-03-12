// src/components/NoteEditor.jsx
import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";

const NoteEditor = () => {
  const { selectedNote, notes, updateNoteContent } = useAppContext();
  const noteObj = notes.find((n) => n.id === selectedNote) || {};
  const [content, setContent] = useState(noteObj.content || "");

  // Update local state when a different note is selected
  useEffect(() => {
    setContent(noteObj.content || "");
  }, [noteObj]);

  // Auto-save functionality: debounced update when content changes
  useEffect(() => {
    if (!selectedNote) return;
    const timeoutId = setTimeout(() => {
      updateNoteContent(selectedNote, content);
    }, 1000); // waits 1 second after last change

    return () => clearTimeout(timeoutId);
  }, [content, selectedNote, updateNoteContent]);

  return (
    <div className="flex-1 p-4 flex flex-col bg-gray-800">
      <h2 className="text-2xl mb-4 text-white">Contenu de la Note</h2>
      {selectedNote ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="flex-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-white"
        />
      ) : (
        <p className="text-white">Sélectionne une note</p>
      )}
    </div>
  );
};

export default NoteEditor;
