import "./Editor.css";
import { NoteEditor } from "./NoteEditor";
import { NoteOperations } from "./NoteOperations";

export const Editor = ({ currentNote, refreshData, createModal }) => {
    const newNote = !currentNote._id;
    return (
        <div className="Editor">
            <NoteEditor {...{ currentNote, refreshData, createModal }} />
            {(!currentNote.trash && !newNote) && <NoteOperations {...{ currentNote, refreshData, createModal }} />}
        </div>
    );
}