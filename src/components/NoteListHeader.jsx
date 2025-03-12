// src/components/NoteListHeader.jsx
import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";

const NoteListHeader = () => {
  const { createEmptyNote, sortNotes, searchNotes } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchNotes(query);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-700">
      <button
        onClick={createEmptyNote}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
      >
        + Nouvelle note
      </button>
      <div className="flex-1 mx-2">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <button
        onClick={sortNotes}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
      >
        Trier
      </button>
    </div>
  );
};

export default NoteListHeader;
