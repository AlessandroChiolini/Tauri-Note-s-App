import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Split from "react-split";
import { invoke } from "@tauri-apps/api/core";
import NotebookList from "./components/NotebookList";
import NoteList from "./components/NoteList";
import NoteEditor from "./components/NoteEditor";
import "./App.css";
import { useAppContext } from "./contexts/AppContext";

function App() {
  const { selectNotebook } = useAppContext();

  // Fonction pour mettre à jour le notebook de la note via l'API Tauri
  const updateNoteNotebook = async (noteId, newNotebookId) => {
    try {
      await invoke("update_note_notebook", { noteId, newNotebookId });
    } catch (error) {
      console.error("Error updating note notebook:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;

    // Si la note est déposée dans un autre droppable (notebook différent)
    if (source.droppableId !== destination.droppableId) {
      console.log(
        "Changing notebook for note", draggableId, "to", destination.droppableId
      );
      await updateNoteNotebook(draggableId, destination.droppableId);
      selectNotebook(destination.droppableId);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-screen h-screen bg-gray-900 text-white">
        {/* Header sans bordure et avec fond uniforme */}
        <div className="p-3 fixed top-0 left-0 right-0 z-50 flex items-center bg-gray-900">
          <h1 className="text-white text-xl font-bold">Notes App</h1>
        </div>
        
        {/* Contenu principal, décalé pour laisser place au header */}
        <div className="pt-16 h-full">
          <Split
            className="flex h-full"
            sizes={[15, 25, 60]}
            minSize={100}
            gutterSize={4}
            expandToMin={false}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
          >
            <NotebookList />
            <NoteList />
            <NoteEditor />
          </Split>
        </div>
      </div>
    </DragDropContext>
  );
}

export default App;
