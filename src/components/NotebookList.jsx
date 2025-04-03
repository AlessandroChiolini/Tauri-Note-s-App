// src/components/NotebookList.jsx
import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import CreateNotebookForm from "./CreateNotebookForm";
import TrashBin from "./TrashBin"; // Import the TrashBin component

const NotebookList = () => {
  const { notebooks, selectedNotebook, selectNotebook, deleteNotebook } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  // Hide context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleContextMenu = (e, nbId) => {
    e.preventDefault();
    setContextMenu({ nbId, x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    if (contextMenu?.nbId) {
      deleteNotebook(contextMenu.nbId);
      setContextMenu(null);
    }
  };

  return (
    <div className="w-56 bg-gray-800 text-white p-4 flex flex-col relative">
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
          <li key={nb.id} className="list-none">
            <button 
              onClick={() => selectNotebook(nb.id)}
              onContextMenu={(e) => handleContextMenu(e, nb.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') selectNotebook(nb.id); }}
              className={`w-full text-left cursor-pointer px-2 py-1 hover:bg-gray-700 rounded ${
                nb.id === selectedNotebook ? "bg-gray-600 font-bold" : ""
              }`}
            >
              {nb.title}
            </button>
          </li>
        ))}
      </ul>
      
      {/* Add the TrashBin component here */}
      <TrashBin />
      
      {contextMenu && (
        <div
          className="absolute bg-white text-black border border-gray-300 rounded shadow-lg z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleDelete}
            className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
          >
            Delete Notebook
          </button>
        </div>
      )}
    </div>
  );
};

export default NotebookList;
