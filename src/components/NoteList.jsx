// src/components/NoteList.jsx
import React, { useState, useEffect } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { useAppContext } from "../contexts/AppContext";
import NoteListHeader from "./NoteListHeader";

const NoteList = () => {
  const { notes, selectedNote, selectNote, deleteNote, selectedNotebook } = useAppContext();
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleContextMenu = (e, noteId) => {
    e.preventDefault();
    setContextMenu({ noteId, x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    if (contextMenu && contextMenu.noteId) {
      deleteNote(contextMenu.noteId);
      setContextMenu(null);
    }
  };

  return (
    <div className="flex-1 bg-gray-700 text-white flex flex-col min-w-[200px] relative">
      <NoteListHeader />
      <Droppable droppableId={`notes-${selectedNotebook}`}>
        {(provided) => (
          <ul 
            className="space-y-2 overflow-y-auto" 
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {notes.map((note, index) => (
              <Draggable key={note.id} draggableId={String(note.id)} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => selectNote(note.id)}
                    onContextMenu={(e) => handleContextMenu(e, note.id)}
                    className={`cursor-pointer px-2 py-1 hover:bg-gray-600 ${
                      note.id === selectedNote ? "bg-gray-500 text-white" : ""
                    }`}
                  >
                    {note.title || "(Sans titre)"}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
      {contextMenu && (
        <div
          className="absolute bg-white text-black border border-gray-300 rounded shadow-lg z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleDelete}
            className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
          >
            Delete note
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteList;
