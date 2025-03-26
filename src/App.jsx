import React from "react";
import Split from "react-split";
import NotebookList from "./components/NotebookList";
import NoteList from "./components/NoteList";
import NoteEditor from "./components/NoteEditor";
import Clock from "./components/Clock";
import "./App.css";

function App() {
  return (
    <div className="h-screen flex flex-col">
      {/* En-tête fixe */}
      <div className="bg-gray-900 p-3 flex justify-between items-center border-b border-gray-700 fixed top-0 left-0 right-0 z-50">
        <h1 className="text-white text-xl font-bold">Notes App</h1>
      </div>
      
      {/* Contenu principal avec un padding en haut pour éviter le chevauchement */}
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
  );
}

export default App;
