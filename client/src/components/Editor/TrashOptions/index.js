import "./TrashOptions.css";
import { Note } from "../../../api";
import { Button } from "../../Form";

export const TrashOptions = ({ currentNote, refreshData, createModal }) => {
    const restoreNote = () => {
        Note.trashNote(currentNote._id).then(() => refreshData()); // todo keep an eye on this
        // choosing not to include updateCurrentNote(null) as callback in case user wants to start editing immediately after removing from trash
    }
    const deletePermanently = () => {
        createModal('deleteNotePermanently', 'form', { _id: currentNote._id, onSuccess: () => refreshData() });
    }
    return (
        <div className="TrashOptions">
            <i className="giantIcon fas fa-exclamation-triangle"></i>
            <p>This note can't be edited while it is in the Trash.</p>
            <div className="smaller buttons">
                <Button onClick={restoreNote}
                        showLoadingIcon={true}>
                    Restore note
                </Button>
                <button className="caution" onClick={deletePermanently}>Delete permanently</button>
            </div>
        </div>
    );
}