import { useEffect, useRef } from "react";
import Immutable from 'immutable';
import { Editor, EditorState, RichUtils, DefaultDraftBlockRenderMap } from 'draft-js';

export const NoteTitle = ({ newNote, currentNote, updateEditorTitle, unsavedChanges, updateUnsavedChanges }) => {
    useEffect(() => {
        if (newNote) titleInput?.current?.focus();
    }, [newNote]);
    const titleInput = useRef(null);
    const title = newNote ? '' : currentNote.title;
    const handleInput = (e) => {
        updateEditorTitle(e.target.value);
        if (!unsavedChanges) updateUnsavedChanges(true);
    }
    return (
        <input
            type="text"
            readOnly={currentNote.trash}
            ref={titleInput}
            defaultValue={title}
            placeholder="Add a title"
            onInput={handleInput} />
    );
}

export const NoteBody = ({ currentNote, editorState, updateEditorState, unsavedChanges, updateUnsavedChanges }) => {
    const editorRef = useRef(null);
    const handleChange = (newState) => {
        const currentContent = editorState.getCurrentContent();
        const newContent = newState.getCurrentContent();
        updateEditorState(newState);
        if (currentContent === newContent) return;
        if (!unsavedChanges) updateUnsavedChanges(true);
    }
    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            updateEditorState(newState);
            if (!unsavedChanges) updateUnsavedChanges(true);
            return 'handled';
        }
        return 'not-handled';
    }
    const focusEditor = (e) => {
        if (!editorRef.current.editor.contains(e.target)) updateEditorState(EditorState.moveFocusToEnd(editorState));
    }
    const blockRenderMap = Immutable.Map({
        'ALIGN-LEFT': {
            element: 'div',
            wrapper: <CustomBlock type="align-left" />
        },
        'ALIGN-CENTER': {
            element: 'div',
            wrapper: <CustomBlock type="align-center" />
        },
        'ALIGN-RIGHT': {
            element: 'div',
            wrapper: <CustomBlock type="align-right" />
        },
        'ALIGN-JUSTIFY': {
            element: 'div',
            wrapper: <CustomBlock type="align-justify" />
        }
    });
    const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);
    return (
        <div className="NoteBody" onClick={focusEditor}>
            <Editor
                readOnly={currentNote.trash}
                editorState={editorState}
                blockRenderMap={extendedBlockRenderMap}
                handleKeyCommand={handleKeyCommand}
                placeholder="Enter some text..."
                onChange={handleChange}
                ref={editorRef}
            />
        </div>
    );
}

const CustomBlock = ({ type, children }) => {
    return (
        <div className={type}>
            {children}
        </div>
    );
}