import "./Editor.css";
import { NoteEditor } from "./NoteEditor";

export const Editor = ({ currentNote, refreshData, createModal }) => {
    return (
        <div className="Editor">
            <NoteEditor {...{ currentNote, refreshData, createModal }} />
        </div>
    );
}