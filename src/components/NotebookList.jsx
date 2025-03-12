// src/components/NotebookList.jsx
import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import CreateNotebookForm from "./CreateNotebookForm";

const NotebookList = () => {
  const { notebooks, selectedNotebook, selectNotebook } = useAppContext();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="w-56 bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-xl mb-4">Notebooks</h2>
      <button 
        onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
      >
        {showForm ? "Annuler" : "+ Ajouter Notebook"}
      </button>
      {showForm && <CreateNotebookForm />}
      <ul className="space-y-2">
        {notebooks.map((nb) => (
          <li 
            key={nb.id} 
            onClick={() => selectNotebook(nb.id)}
            className={`cursor-pointer px-2 py-1 hover:bg-gray-700 rounded ${
              nb.id === selectedNotebook ? "bg-gray-600 font-bold" : ""
            }`}
          >
            {nb.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotebookList;
