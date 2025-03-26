// src/components/NoteList.jsx
import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import NoteListHeader from "./NoteListHeader";

const NoteList = () => {
  const { notes, selectedNote, selectNote, deleteNote } = useAppContext();
  const [contextMenu, setContextMenu] = useState(null);

  // Hide context menu when clicking anywhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleContextMenu = (e, noteId) => {
    e.preventDefault();
    setContextMenu({ noteId, x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    if (contextMenu && contextMenu.noteId) {
      deleteNote(contextMenu.noteId);
      setContextMenu(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gray-800 flex flex-col relative">
      <NoteListHeader />
      <ul className="space-y-2 overflow-y-auto p-2">
        {notes.map((note) => (
          <li
            key={note.id}
            onClick={() => selectNote(note.id)}
            onContextMenu={(e) => handleContextMenu(e, note.id)}
            className={`cursor-pointer p-2 hover:bg-gray-600 rounded ${
              note.id === selectedNote ? "bg-gray-500" : ""
            }`}
          >
            <div className="flex flex-col">
              <div className="text-white font-medium">
                {note.title || "(Sans titre)"}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Créé le: {formatDate(note.created_at)}</span>
                <span>Modifié le: {formatDate(note.updated_at)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {contextMenu && (
        <div
          className="absolute bg-white text-black border border-gray-300 rounded shadow-lg z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleDelete}
            className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
          >
            Delete note
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteList;
