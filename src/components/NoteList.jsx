// src/components/NoteList.jsx
import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import CreateNoteForm from "./CreateNoteForm";

const NoteList = () => {
  const { notes, selectedNote, selectNote } = useAppContext();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="w-56 bg-gray-700 text-white flex flex-col">
      {showForm && <CreateNoteForm />}
      <ul className="space-y-2">
        {notes.map((note) => (
          <li
            key={note.id}
            onClick={() => selectNote(note.id)}
            className={`cursor-pointer px-2 py-1 hover:bg-gray-600 ${
              note.id === selectedNote ? "bg-gray-500 text-white" : ""
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
