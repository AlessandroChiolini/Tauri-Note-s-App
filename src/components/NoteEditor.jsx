// src/components/NoteEditor.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../contexts/AppContext";

const NoteEditor = () => {
  const { selectedNote, notes, updateNoteContent, updateNoteTitle } = useAppContext();
  const noteObj = notes.find((n) => n.id === selectedNote) || {};

  // Local state for content and title
  const [content, setContent] = useState(noteObj.content || "");
  const [title, setTitle] = useState(noteObj.title || "");
  const titleInputRef = useRef(null);

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

  // Debounce auto-save for note title
  useEffect(() => {
    if (!selectedNote) return;
    const timeoutId = setTimeout(() => {
      updateNoteTitle(selectedNote, title);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [title, selectedNote, updateNoteTitle]);

  // Automatically focus the title input if the title is empty
  useEffect(() => {
    if (selectedNote && title.trim() === "" && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [selectedNote, title]);

  return (
    <div className="flex-1 p-4 flex flex-col bg-gray-800">
      {selectedNote ? (
        <>
          <input
            ref={titleInputRef}
            type="text"
            placeholder="Titre de la note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-white"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="flex-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-white"
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-white">
          Sélectionnez une note pour commencer
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
