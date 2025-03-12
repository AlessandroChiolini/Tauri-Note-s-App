// src/components/NoteEditor.jsx
import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";

const NoteEditor = () => {
  const { selectedNote, notes, updateNoteContent } = useAppContext();
  const noteObj = notes.find((n) => n.id === selectedNote) || {};
  const [content, setContent] = useState(noteObj.content || "");

  useEffect(() => {
    setContent(noteObj.content || "");
  }, [noteObj]);

  const handleSave = () => {
    updateNoteContent(selectedNote, content);
  };

  return (
    <div className="flex-1 p-4 flex flex-col">
      <h2 className="text-2xl mb-4">Contenu de la Note</h2>
      {selectedNote ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="flex-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
          />
          <button 
            onClick={handleSave}
            className="mt-4 bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded"
          >
            Enregistrer
          </button>
        </>
      ) : (
        <p>Sélectionne une note</p>
      )}
    </div>
  );
};

export default NoteEditor;
