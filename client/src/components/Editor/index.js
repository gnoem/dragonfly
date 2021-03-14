import { EditorSpace } from './components/EditorSpace';
import { NoteOperations } from './components/NoteOperations';

export const Editor = (props) => {
    const { currentNote } = props;
    const newNote = !currentNote._id;
    return (
        <div className="Editor">
            <EditorSpace {...props} />
            {(!currentNote.trash && !newNote) && <NoteOperations {...props} />}
        </div>
    );
}