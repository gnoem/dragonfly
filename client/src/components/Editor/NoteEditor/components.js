import { useEffect, useRef } from "react";
import Immutable from 'immutable';
import { Editor, EditorState, RichUtils, DefaultDraftBlockRenderMap } from 'draft-js';

export const NoteTitle = (props) => {
    const { newNote, currentNote, unsavedChanges } = props;
    useEffect(() => {
        if (newNote) titleInput?.current?.focus();
    }, [newNote]);
    const titleInput = useRef(null);
    const title = newNote ? '' : currentNote.title;
    const handleInput = (e) => {
        props.updateEditorTitle(e.target.value);
        if (!unsavedChanges) props.updateUnsavedChanges(true);
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

export const NoteBody = (props) => {
    const { currentNote, editorState, unsavedChanges } = props;
    const editorRef = useRef(null);
    const handleChange = (newState) => {
        const currentContent = editorState.getCurrentContent();
        const newContent = newState.getCurrentContent();
        props.updateEditorState(newState);
        if (currentContent === newContent) return;
        if (!unsavedChanges) props.updateUnsavedChanges(true);
    }
    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            props.updateEditorState(newState);
            if (!unsavedChanges) props.updateUnsavedChanges(true);
            return 'handled';
        }
        return 'not-handled';
    }
    const focusEditor = (e) => {
        if (!editorRef.current.editor.contains(e.target)) props.updateEditorState(EditorState.moveFocusToEnd(editorState));
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

const CustomBlock = (props) => {
    const { type, children } = props;
    return (
        <div className={type}>
            {children}
        </div>
    );
}