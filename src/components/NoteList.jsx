// src/components/NoteList.jsx
import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import CreateNoteForm from "./CreateNoteForm";

const NoteList = () => {
  const { notes, selectedNote, selectNote } = useAppContext();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="notes-sidebar">
      <h2>Notes</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Annuler" : "+ Ajouter Note"}
      </button>
      {showForm && <CreateNoteForm />}
      <ul>
        {notes.map((note) => (
          <li
            key={note.id}
            onClick={() => selectNote(note.id)}
            className={note.id === selectedNote ? "active" : ""}
          >
            {note.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;
