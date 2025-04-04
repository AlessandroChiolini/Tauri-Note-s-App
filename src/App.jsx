import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Split from "react-split";
import { invoke } from "@tauri-apps/api/core";
import NotebookList from "./components/NotebookList";
import NoteList from "./components/NoteList";
import NoteEditor from "./components/NoteEditor";
import Clock from "./components/Clock";
import "./App.css";
import { useAppContext } from "./contexts/AppContext";

function App() {
  const { selectNotebook } = useAppContext();

  // New helper to call the backend command update_note_notebook
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

    // If the note is dropped in a different droppable area (e.g. a different notebook)
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
      <div className="h-screen flex flex-col">
        <div className="bg-gray-900 p-3 flex justify-between items-center border-b border-gray-700 fixed top-0 left-0 right-0 z-50">
          <h1 className="text-white text-xl font-bold">Notes App</h1>
          <Clock />
        </div>
        <div className="pt-16 flex flex-1">
          <Split
            className="flex flex-1"
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
