// src/components/NoteEditor.jsx
import React, { useState, useEffect } from "react";
import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { useAppContext } from "../contexts/AppContext";
import NoteInfoBtn from "./NoteInfoBtn";

const NoteEditor = () => {
  const { selectedNote, notes, updateNoteContent, updateNoteTitle } =
    useAppContext();
  const noteObj = notes.find((n) => n.id === selectedNote) || {};

  // Local state for content and title
  const [content, setContent] = useState(noteObj.content || "");
  const [title, setTitle] = useState(noteObj.title || "");
  const [selectedTab, setSelectedTab] = useState("write");

  // Setup a Showdown converter for Markdown preview
  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  // Update local state when the selected note changes
  useEffect(() => {
    setContent(noteObj.content || "");
    setTitle(noteObj.title || "");
  }, [selectedNote]);

  // Debounce auto-save for note content
  useEffect(() => {
    if (!selectedNote) return;
    const timeoutId = setTimeout(() => {
      updateNoteContent(selectedNote, content);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [content, selectedNote, updateNoteContent]);

  // Debounce auto-save for note title
  useEffect(() => {
    if (!selectedNote) return;
    const timeoutId = setTimeout(() => {
      updateNoteTitle(selectedNote, title);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [title, selectedNote, updateNoteTitle]);

  return (
    <div className="flex-1 p-4 flex flex-col bg-gray-800 overflow-hidden">
      {selectedNote ? (
        <>
          <input
            type="text"
            placeholder="Titre de la note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4 p-2 rounded focus:outline-none focus:ring focus:border-blue-300 text-white"
            autoFocus
          />
        <NoteInfoBtn
            title="Infos de la note"
            content={`ID: ${noteObj.id}\n📅 Créé : ${noteObj.created_at || "N/A"}\n✏️ Mis à jour : ${noteObj.updated_at || "N/A"}`}
            triggerText="🛈 Détails"
        />


          {/* Wrap the editor in a container that fills remaining height */}
          <div className="flex-1 min-h-0 h-full overflow-y-auto">
            <ReactMde
              value={content}
              onChange={setContent}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              l18n={{
                write: "✍️",
                preview: "👀",
              }}
              generateMarkdownPreview={(markdown) =>
                Promise.resolve(converter.makeHtml(markdown))
              }
              childProps={{
                writeButton: {
                  tabIndex: -1,
                },
              }}
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-white">
          Sélectionnez une note pour commencer
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
