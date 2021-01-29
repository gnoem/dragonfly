import { useState, useEffect, useRef } from 'react';
import Button from './Button';
import EditorToolbar from './EditorToolbar';
import Immutable from 'immutable';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, DefaultDraftBlockRenderMap } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function NoteEditor(props) {
    const { user, currentNote, unsavedChanges, shouldSubmit } = props;
    const newNote = !currentNote.content;
    const [editorTitle, setEditorTitle] = useState(newNote ? '' : currentNote.title);
    const [editorState, setEditorState] = useState(
        newNote ? () => EditorState.createEmpty() : EditorState.createWithContent(convertFromRaw(currentNote.content))
    );
    const titleInput = useRef(null);
    const editorRef = useRef(null);
    useEffect(() => {
        if (newNote) titleInput.current.focus();
    }, [newNote]);
    useEffect(() => {
        if (!shouldSubmit) return;
        handleSubmit();
        props.updateShouldSubmit(false);
    }, [shouldSubmit]);
    // todo useeffect for Ctrl + S
    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            props.updateUnsavedChanges(true);
            return 'handled';
        }
        return 'not-handled';
    }
    const focusEditor = (e) => {
        if (!editorRef.current.editor.contains(e.target)) setEditorState(EditorState.moveFocusToEnd(editorState));
    }
    const controlStyle = (e, type, value) => {
        e.preventDefault(); // onMouseDown + e.preventDefault rather than onClick preserves focus state in text editor
        const newState = (type === 'inline')
            ?   RichUtils.toggleInlineStyle(editorState, value)
            :   RichUtils.toggleBlockType(editorState, value);
        setEditorState(newState);
    }
    const noteTitle = () => {
        const title = newNote ? '' : currentNote.title;
        const handleInput = (e) => {
            setEditorTitle(e.target.value);
            props.updateUnsavedChanges(true);
        }
        return (
            <input type="text" readOnly={currentNote.trash} ref={titleInput} key={title} defaultValue={title} placeholder="Add a title" onInput={handleInput} />
        )
    }
    const handleChange = (state) => {
        setEditorState(state);
        if (unsavedChanges) return;
        const inputTypes = ['insert-characters', 'backspace-character', 'insert-fragment', 'remove-range'];
        if (!inputTypes.includes(state.getLastChangeType())) return;
        props.updateUnsavedChanges(true); // tell parent component there are unsaved changes
    }
    const handleSubmit = async () => {
        console.log(editorTitle);
        const contentState = editorState.getCurrentContent();
        let ROUTE = newNote ? '/add/note' : '/edit/note';
        const response = await fetch(ROUTE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: newNote ? user._id : currentNote._id,
                title: editorTitle,
                content: convertToRaw(contentState)
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        props.updateUnsavedChanges(false);
        props.refreshData(); // */
    }
    const noteIsInTrash = () => {
        const untrashNote = async (id) => {
            const response = await fetch('/trash/note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: id })
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success: true response from server');
            props.refreshData();
            props.updateCurrentNote(false);
        }
        return (
            <div className="noteIsInTrash">
                <i className="giantIcon fas fa-exclamation-triangle"></i>
                <p>This note can't be edited while still in the Trash.</p>
                <div className="smaller buttons">
                    <Button onClick={() => untrashNote(currentNote._id)} loadingIconSize="2rem">Restore note</Button>
                    <button className="caution" onClick={() => props.deleteNotePermanently(currentNote._id)}>Delete permanently</button>
                </div>
            </div>
        );
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
        <div className="NoteEditor">
            {currentNote.trash
                ? noteIsInTrash()
                : <EditorToolbar controlStyle={controlStyle} editorState={editorState} />}
            {noteTitle()}
            <div className="Editable" onClick={focusEditor}>
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
            {unsavedChanges && <div className="saveChanges">
                <Button onClick={handleSubmit} loadingIconSize="2.5rem">Save Changes</Button>
            </div>}
        </div>
    )
}

function CustomBlock({ type, children }) {
    return (
        <div className={type}>
            {children}
        </div>
    )
}