// src/components/NoteList.jsx
import React from "react";
import { useAppContext } from "../contexts/AppContext";
import NoteListHeader from "./NoteListHeader";

const NoteList = () => {
  const { notes, selectedNote, selectNote } = useAppContext();

  return (
    <div className="flex-1 bg-gray-700 text-white flex flex-col min-w-[200px]">
      <NoteListHeader />
      <ul className="space-y-2 overflow-y-auto">
        {notes.map((note) => (
          <li
            key={note.id}
            onClick={() => selectNote(note.id)}
            className={`cursor-pointer px-2 py-1 hover:bg-gray-600 ${
              note.id === selectedNote ? "bg-gray-500 text-white" : ""
            }`}
          >
            {note.title || "(Sans titre)"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;
