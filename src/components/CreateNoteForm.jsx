// src/components/CreateNoteForm.jsx
import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";

const CreateNoteForm = () => {
  const { selectedNotebook, addNote } = useAppContext();
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addNote(title);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
      <input
        type="text"
        placeholder="Titre de la note"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring focus:border-green-300"
      />
      <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">
        Créer
      </button>
    </form>
  );
};

export default CreateNoteForm;
