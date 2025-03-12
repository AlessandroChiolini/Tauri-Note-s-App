// src/components/CreateNotebookForm.jsx
import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";

const CreateNotebookForm = () => {
  const { addNotebook } = useAppContext();
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addNotebook(title);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="create-notebook-form">
      <input
        type="text"
        placeholder="Titre du notebook"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit">Créer</button>
    </form>
  );
};

export default CreateNotebookForm;
