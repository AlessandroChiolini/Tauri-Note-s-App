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
    <div className="editor">
      <h2>Contenu de la Note</h2>
      {selectedNote ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <button onClick={handleSave}>Enregistrer</button>
        </>
      ) : (
        <p>Sélectionne une note</p>
      )}
    </div>
  );
};

export default NoteEditor;
