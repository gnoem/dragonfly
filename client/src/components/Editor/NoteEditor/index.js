import "./NoteEditor.css";
import "draft-js/dist/Draft.css";
import { useState, useEffect, useContext } from "react";
import { Note } from "api";
import { DataContext, ViewContext, MobileContext } from "contexts";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import { EditorToolbar } from "../EditorToolbar";
import { TrashOptions } from "../TrashOptions";
import { NoteTitle, NoteBody } from "./components";
import { Button } from "../../Form";
import { NoteOperations } from "../NoteOperations";
import { GiantCornerButton } from "../../Page";

export const NoteEditor = ({ currentNote, refreshData, createModal }) => {
    const { mobileLayout } = useContext(MobileContext);
    const { updateCurrentNote, unsavedChanges, updateUnsavedChanges } = useContext(ViewContext);
    const { user } = useContext(DataContext);
    const newNote = !currentNote._id;
    const [editorTitle, setEditorTitle] = useState(newNote ? '' : currentNote.title);
    const [editorState, setEditorState] = useState(
        newNote ? () => EditorState.createEmpty() : EditorState.createWithContent(convertFromRaw(currentNote.content))
    );
    const [showSaveChangesButton, setShowSaveChangesButton] = useState(false);
    const [simulateSaveButtonClick, setSimulateSaveButtonClick] = useState(false); // prop for button, to simulate click event after Ctrl + S
    useEffect(() => {
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
        }
    }, []);
    useEffect(() => {
        if (unsavedChanges) setShowSaveChangesButton(true);
    }, [unsavedChanges]);
    const handleSubmit = async (optionalCallback) => {
        const contentState = editorState.getCurrentContent();
        const defaultCallback = () => {
            updateUnsavedChanges(false);
            if (!newNote && simulateSaveButtonClick) setSimulateSaveButtonClick(false);
            // ^^^ error (can't perform state update on unmounted component) if i don't include !newNote
            if (newNote) updateCurrentNote(null); //idk why but this feels right
            // when saving a new note, close the editor afterwards
            // won't happen when editing existing notes - you open something up to work on it
            // todo come back to this
            refreshData();
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
            updateUnsavedChanges(false);
            updateCurrentNote(null);
            refreshData();
        }
        createModal('warnUnsavedChanges', 'form', { saveChanges: () => handleSubmit(closeEditor), discardChanges: closeEditor });
    }
    const handleExit = () => {
        if (unsavedChanges) return warnUnsavedChanges();
        updateCurrentNote(null);
    }
    const editorShouldInherit = {
        newNote,
        currentNote,
        editorState,
        updateEditorState: setEditorState,
        updateEditorTitle: setEditorTitle,
        unsavedChanges,
        updateUnsavedChanges
    }
    return (
        <>
            <GiantCornerButton className="exit" onClick={handleExit} />
            <div className="NoteEditor">
                {(currentNote.trash) && <TrashOptions {...{ currentNote, refreshData, createModal }} />}
                {(!currentNote.trash && !mobileLayout) && <EditorToolbar {...{ editorState, updateEditorState: setEditorState }} />}
                <NoteTitle {...editorShouldInherit} />
                <NoteBody {...editorShouldInherit} />
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
            {(!currentNote.trash && !newNote) &&
                <NoteOperations {...{ currentNote, editorState, updateEditorState: setEditorState, refreshData, createModal }} />}
        </>
    );
}