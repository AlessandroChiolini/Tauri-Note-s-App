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
    <form onSubmit={handleSubmit} className="create-note-form">
      <input
        type="text"
        placeholder="Titre de la note"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit">Créer</button>
    </form>
  );
};

export default CreateNoteForm;
