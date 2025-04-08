# Components Documentation

This folder contains React components that form the user interface of the application. Each component is responsible for a specific part of the application's functionality. Below is a brief overview of each file:

# 1. TrashBin.jsx

Manages the display and actions related to deleted notes. Users can restore or permanently delete notes from the trash. It calls backend functions to retrieve, restore, or delete notes and provides confirmation prompts to prevent unintended actions.

The TrashBin component includes the following functionality:

```javascript
return (
    <div className="mt-6 border-t border-gray-700 pt-4">
        <div onClick={() => setIsOpen(!isOpen)}>
            <span>Trash</span>
            <span>({deletedNotes.length})</span>
        </div>

        {isOpen && (
            <div>
                {restoreError && <div className="error">{restoreError}</div>}
                <ul>
                    {deletedNotes.map((note) => (
                        <li key={note.id}>
                            {note.title || "Sans titre"}
                            <button onClick={() => handleRestore(note.id, note.notebook_id)}>
                                ↩️
                            </button>
                            <button onClick={() => handlePermanentDelete(note.id)}>
                                🗑️
                            </button>
                        </li>
                    ))}
                </ul>
                <button onClick={handleEmptyTrash}>Empty Trash</button>
            </div>
        )}
    </div>
);
```

# 2. NoteListHeader.jsx

Provides the header for the note list. It includes buttons for creating a new note and sorting notes by title, creation date, or modification date. The component updates sorting state and triggers actions provided in the application's context.

The NoteListHeader component includes the following functionality:

```javascript
return (
    <div className="flex items-center justify-between p-2 bg-gray-700">
        <button onClick={createEmptyNote} className="bg-blue-500 text-white px-3 py-1 rounded">
            + Nouvelle note
        </button>
        <div className="flex gap-2">
            <button onClick={handleTitleSort}>🔤</button>
            <button onClick={handleCreationSort} title="Trier par date de création">📅</button>
            <button onClick={handleModificationSort} title="Trier par date de modification">✏️</button>
        </div>
    </div>
);
```

# 3. NoteList.jsx

Displays a list of notes within a selected notebook. Incorporates drag-and-drop functionality (using react-beautiful-dnd) for rearranging notes and supports context menu actions (e.g., deleting a note). It also highlights the selected note.

The NoteList component includes the following functionality:

```javascript
<ul ref={provided.innerRef} {...provided.droppableProps}>
    {notes.map((note, index) => (
        <Draggable key={note.id} draggableId={String(note.id)} index={index}>
            {(provided) => (
                <li
                    ref={provided.innerRef}
                    onClick={() => selectNote(note.id)}
                    className={note.id === selectedNote ? "bg-gray-500" : "hover:bg-gray-600"}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onContextMenu={(e) => handleContextMenu(e, note.id)}
                >
                    <div>{note.title || "(Sans titre)"}</div>
                    <div>Modifié le: {formatDate(note.updated_at)}</div>
                </li>
            )}
        </Draggable>
    ))}
    {provided.placeholder}
</ul>
```

# 4. NoteInfoBtn.jsx

A simple button that opens a modal window to display additional information about a note. The modal includes a title and content, and users can dismiss it to continue editing or viewing notes.

The NoteInfoBtn component includes the following functionality:

```javascript
<>
    <button onClick={() => setIsOpen(true)} className="text-blue-500">
        {triggerText}
    </button>
    {isOpen && (
        <div className="modal">
            <div className="modal-header">
                <span>{title}</span>
                <button onClick={() => setIsOpen(false)}>✖</button>
            </div>
            <div className="modal-body">
                {content}
            </div>
        </div>
    )}
</>
```

# 5. NoteEditor.jsx

The core component for editing notes using Markdown. It provides a text area for editing, along with a live preview pane that renders the Markdown content. Users can format text (bold, italic, code, etc.) or insert images. It also handles auto-saving of notes and image uploads, converting images to Markdown format.

The NoteEditor component includes the following functionality:

```javascript
<textarea
    ref={textareaRef}
    value={content}
    onChange={(e) => setContent(e.target.value)}
    placeholder="Écrivez votre note ici en Markdown..."
    className="bg-gray-900 text-white"
/>
<div
    id="markdown-preview"
    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    className="overflow-auto markdown-body"
/>
```

# 6. NotebookList.jsx

Displays the list of notebooks and manages their selection. In addition to listing notebooks, it supports creating new notebooks (via CreateNotebookForm) and includes a droppable area for drag-and-drop note functionality. The component also integrates the TrashBin component.

The NotebookList component includes the following functionality:

```javascript
<ul>
    {notebooks.map((nb) => (
        <Droppable droppableId={String(nb.id)} key={nb.id}>
            {(provided) => (
                <li
                    onClick={() => selectNotebook(nb.id)}
                    onContextMenu={(e) => handleContextMenu(e, nb.id)}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={nb.id === selectedNotebook ? "bg-gray-600 font-bold" : "hover:bg-gray-700"}
                >
                    {nb.title}
                    {provided.placeholder}
                </li>
            )}
        </Droppable>
    ))}
</ul>
<TrashBin />
```

# 7. CreateNotebookForm.jsx

A simple form that allows users to create new notebooks. It captures the notebook title and submits it to the application's context to add a new notebook.

The CreateNotebookForm component includes the following functionality:

```javascript
<form onSubmit={handleSubmit} className="flex space-x-2">
    <input
        type="text"
        placeholder="Titre du notebook"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded px-2 py-1"
    />
    <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
        Créer
    </button>
</form>
```

# 8. CreateNoteForm.jsx

Similar to the notebook form, this input form is used to create a new note. It captures the note title and adds the note when the user submits the form (or blurs the input field).

The CreateNoteForm component includes the following functionality:

```javascript
<input
    type="text"
    placeholder="Titre de la note"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    onBlur={handleBlur}
    onKeyDown={handleKeyDown}
    className="border rounded px-2 py-1"
/>
```

# 9. Clock.jsx

Displays creation and modification timestamps for the currently selected note. It formats dates according to the French locale and updates the display based on the selected note.

The Clock component includes the following functionality:

```javascript
<div className="text-white text-right">
    {selectedNote ? (
        <div>
            <div>
                <span>Créée le:</span>
                <span>{formatDate(noteObj.created_at)}</span>
            </div>
            <div>
                <span>Modifiée le:</span>
                <span>{formatDate(noteObj.updated_at)}</span>
            </div>
        </div>
    ) : (
        <span>Sélectionnez une note</span>
    )}
</div>
```

Each component plays a role in the overall user experience: managing notes, providing editing and preview capabilities, organizing note collections, and ensuring smooth interaction with backend functionalities. This structure not only keeps the code modular and maintainable but also allows for easier scalability and testing of individual components.