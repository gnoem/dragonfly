import { EditorSpace } from './components/EditorSpace';
import { NoteOperations } from './components/NoteOperations';

export const Editor = (props) => {
    const { unsavedChanges, currentNote } = props;
    const handleExit = () => {
        if (unsavedChanges) return props.warnUnsavedChanges();
        props.updateCurrentNote(false);
    }
    return (
        <div className="Editor">
            <button className="stealth exit" onClick={handleExit}></button>
            <EditorSpace {...props} />
            {(!currentNote.trash/*  && !newNote */) && <NoteOperations {...props} />}
        </div>
    );
}