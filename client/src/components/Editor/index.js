import "./Editor.css";
import { NoteEditor } from "./NoteEditor";
import { NoteOperations } from "./NoteOperations";

export const Editor = (props) => {
    const { currentNote } = props;
    const newNote = !currentNote._id;
    return (
        <div className="Editor">
            <NoteEditor {...props} />
            {(!currentNote.trash && !newNote) && <NoteOperations {...props} />}
        </div>
    );
}