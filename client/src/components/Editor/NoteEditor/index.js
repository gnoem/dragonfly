import "./NoteEditor.css";
import "draft-js/dist/Draft.css";
import { useState, useEffect, useRef } from "react";
import { Note } from "../../../api";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import { EditorToolbar } from "../EditorToolbar";
import { TrashOptions } from "../TrashOptions";
import { NoteTitle, NoteBody } from "./components";
import { Button } from "../../Form";
import { GiantCornerButton } from "../../Page";

export const NoteEditor = (props) => {
    const { user, currentNote, unsavedChanges } = props;
    const newNote = !currentNote._id;
    const [editorTitle, setEditorTitle] = useState(newNote ? '' : currentNote.title);
    const [editorState, setEditorState] = useState(
        newNote ? () => EditorState.createEmpty() : EditorState.createWithContent(convertFromRaw(currentNote.content))
    );
    const [showSaveChangesButton, setShowSaveChangesButton] = useState(false);
    const [simulateSaveButtonClick, setSimulateSaveButtonClick] = useState(false); // prop for button, to simulate click event after Ctrl + S
    const isMounted = useRef(false);
    useEffect(() => {
        isMounted.current = true;
        const keys = [];
        const keydown = (e) => {
            keys[e.key] = true;
            if (keys['Meta'] && keys['s']) {
                e.preventDefault(); // hides automatic dialog but also prevents keyup event listener(?), hence the next 2 lines
                keys['Meta'] = false;
                keys['s'] = false;
                setSimulateSaveButtonClick(true);
            }
        }
        const keyup = (e) => {
            keys[e.key] = false;
        }
        window.addEventListener('keydown', keydown);
        window.addEventListener('keyup', keyup);
        return () => {
            window.removeEventListener('keydown', keydown);
            window.removeEventListener('keyup', keyup);
            isMounted.current = false;
        }
    }, []);
    useEffect(() => {
        if (unsavedChanges) setShowSaveChangesButton(true);
    }, [unsavedChanges]);
    const handleSubmit = async (optionalCallback) => {
        const contentState = editorState.getCurrentContent();
        const defaultCallback = () => {
            props.updateUnsavedChanges(false);
            if (!newNote && simulateSaveButtonClick) setSimulateSaveButtonClick(false);
            // ^^^ error (can't perform state update on unmounted component) if i don't include !newNote
            if (newNote) props.updateCurrentNote(null); //idk why but this feels right
            // when saving a new note, close the editor afterwards
            // won't happen when editing existing notes - you open something up to work on it
            // todo come back to this
            props.refreshData();
        }
        const handleCreateNote = () => {
            const formData = {
                userId: user._id,
                title: editorTitle,
                content: convertToRaw(contentState)
            };
            Note.createNote(formData).then(optionalCallback ?? defaultCallback);
        }
        const handleEditNote = () => {
            const formData = {
                title: editorTitle,
                content: convertToRaw(contentState)
            };
            return Note.editNote(currentNote._id, formData).then(optionalCallback ?? defaultCallback);
        }
        if (newNote) return handleCreateNote();
        return handleEditNote();
    }
    const warnUnsavedChanges = () => {
        const closeEditor = () => {
            props.updateUnsavedChanges(false);
            props.updateCurrentNote(null);
            props.refreshData();
        }
        props.updateModal('warnUnsavedChanges', 'form', { saveChanges: () => handleSubmit(closeEditor), discardChanges: closeEditor });
    }
    const handleExit = () => {
        if (unsavedChanges) return warnUnsavedChanges();
        props.updateCurrentNote(null);
    }
    const inherit = {
        ...props,
        newNote,
        editorTitle, updateEditorTitle: setEditorTitle,
        editorState, updateEditorState: setEditorState,
    }
    return (
        <>
            <GiantCornerButton className="exit" onClick={handleExit} />
            <div className="NoteEditor">
                {currentNote.trash ? <TrashOptions {...inherit} /> : <EditorToolbar {...inherit} />}
                <NoteTitle {...inherit} />
                <NoteBody {...inherit} />
                {showSaveChangesButton && <div className="saveChanges">
                    <Button type="button"
                            onClick={handleSubmit}
                            isClicked={simulateSaveButtonClick}
                            showLoadingIcon={true}
                            success={!unsavedChanges}
                            unmountButton={() => setShowSaveChangesButton(false)}>
                        Save Changes
                    </Button>
                </div>}
            </div>
        </>
    );
}