// src/components/NoteEditor.jsx
import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";

const NoteEditor = () => {
  const { selectedNote, notes, updateNoteContent, updateNoteTitle } = useAppContext();
  const noteObj = notes.find((n) => n.id === selectedNote) || {};

  // Local state for content and title
  const [content, setContent] = useState(noteObj.content || "");
  const [title, setTitle] = useState(noteObj.title || "");

  // Update local state when the selected note changes
  useEffect(() => {
    setContent(noteObj.content || "");
    setTitle(noteObj.title || "");
  }, [selectedNote]);

  // Debounce auto-save for note content
  useEffect(() => {
    if (!selectedNote) return;
    const timeoutId = setTimeout(() => {
      updateNoteContent(selectedNote, content);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [content, selectedNote, updateNoteContent]);

  // Debounce auto-save for note title continuously
  useEffect(() => {
    if (!selectedNote) return;
    const timeoutId = setTimeout(() => {
      updateNoteTitle(selectedNote, title);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [title, selectedNote, updateNoteTitle]);

  return (
    <div className="flex-1 p-4 flex flex-col bg-gray-800">
      {selectedNote ? (
        <>
          <input
            type="text"
            placeholder="Titre de la note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-white"
            autoFocus
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="flex-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-white"
          />
        </>
      ) : (
        <p className="text-white">Sélectionne une note</p>
      )}
    </div>
  );
};

export default NoteEditor;
