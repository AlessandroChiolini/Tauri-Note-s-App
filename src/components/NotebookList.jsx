// src/components/NotebookList.jsx
import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import CreateNotebookForm from "./CreateNotebookForm";

const NotebookList = () => {
  const { notebooks, selectNotebook } = useAppContext();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="sidebar">
      <h2>Notebooks</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Annuler" : "+ Ajouter Notebook"}
      </button>
      {showForm && <CreateNotebookForm />}
      <ul>
        {notebooks.map((nb) => (
          <li key={nb.id} onClick={() => selectNotebook(nb.id)}>
            {nb.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotebookList;
