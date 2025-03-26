// src/components/NoteListHeader.jsx
import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";

const NoteListHeader = () => {
  const { createEmptyNote, sortNotes } = useAppContext();
  const [isAscending, setIsAscending] = useState(true);

  const handleSort = () => {
    sortNotes();
    setIsAscending(!isAscending);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-700 space-x-2">
      <button
        onClick={createEmptyNote}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
      >
        + Nouvelle note
      </button>

      <button
        onClick={handleSort}
        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded flex items-center gap-2"
      >
        <span>{isAscending ? "🔤" : "🔤↓"}</span>
        <span>Trier par nom</span>
      </button>
    </div>
  );
};

export default NoteListHeader;
