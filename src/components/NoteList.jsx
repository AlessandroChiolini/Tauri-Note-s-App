// src/components/NoteList.jsx
import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import CreateNoteForm from "./CreateNoteForm";

const NoteList = () => {
  const { notes, selectedNote, selectNote } = useAppContext();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="w-56 bg-gray-700 text-white p-4 flex flex-col">
      <h2 className="text-xl mb-4">Notes</h2>
      <button 
        onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
      >
        {showForm ? "Annuler" : "+ Ajouter Note"}
      </button>
      {showForm && <CreateNoteForm />}
      <ul className="space-y-2">
        {notes.map((note) => (
          <li
            key={note.id}
            onClick={() => selectNote(note.id)}
            className={`cursor-pointer px-2 py-1 rounded hover:bg-gray-600 ${
              note.id === selectedNote ? "bg-teal-500 text-black" : ""
            }`}
          >
            {note.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;
