import { useState, useEffect, useRef } from 'react';
import Button from './Button';
import EditorToolbar from './EditorToolbar';
import Immutable from 'immutable';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, DefaultDraftBlockRenderMap } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function NoteEditor(props) {
    const newNote = !props.currentNote.content;
    const [editorTitle, setEditorTitle] = useState('');
    const [editorState, setEditorState] = useState(
        newNote ? () => EditorState.createEmpty() : EditorState.createWithContent(convertFromRaw(props.currentNote.content))
    );
    const titleInput = useRef(null);
    const editorRef = useRef(null);
    useEffect(() => {
        if (!props.submitEditorState) return;
        handleSubmit();
    // do not need handleSubmit or props as a dependency
    // eslint-disable-next-line
    }, [props.submitEditorState]);
    useEffect(() => { // switching between notes
        if (!newNote) {
            setEditorState(EditorState.createWithContent(convertFromRaw(props.currentNote.content)));
            setEditorTitle(props.currentNote.title);
        }
        else {
            setEditorState(EditorState.createEmpty());
            setEditorTitle('');
        }
        props.updateUnsavedChanges(false);
    // excluding props as a dependency because we don't want it firing every time props change
    // eslint-disable-next-line
    }, [newNote, props.currentNote.content, props.currentNote.title]);
    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            props.updateUnsavedChanges(true);
            return 'handled';
        }
        return 'not-handled';
    }
    const focus = (e) => {
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
        const title = newNote ? '' : props.currentNote.title;
        const handleInput = (e) => {
            setEditorTitle(e.target.value);
            props.updateUnsavedChanges(true);
            if (newNote) props.updatePreview(e.target.value);
        }
        return (
            <input type="text" readOnly={props.currentNote.trash} ref={titleInput} key={title} defaultValue={title} placeholder="Add a title" onInput={handleInput} />
        )
    }
    const handleChange = (state) => {
        setEditorState(state);
        if (props.unsavedChanges) return;
        const inputTypes = ['insert-characters', 'backspace-character', 'insert-fragment', 'remove-range'];
        if (!inputTypes.includes(state.getLastChangeType())) return;
        props.updateUnsavedChanges(true); // tell parent component there are unsaved changes
    }
    const handleSubmit = async () => {
        // check if being called from above with props.submitEditorState
        // if so, take as parameter the next() function from saveChanges() in Notes.js,  which will be the value of props.submitEditorState
        const contentState = editorState.getCurrentContent();
        let ROUTE = newNote ? '/add/note' : '/edit/note';
        const response = await fetch(ROUTE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: newNote ? props.user._id : props.currentNote._id,
                title: editorTitle,
                content: convertToRaw(contentState)
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        props.updateUnsavedChanges(false);
        props.refreshData();
        if (body.id) props.updateOnNoteCreation(body.id); // note: server only sends body.id if creating note, not editing note
        if (props.submitEditorState) props.submitEditorState();
        props.updateSubmitEditorState(false);
    }
    const noteOptions = () => {
        return (
            <div className="noteOptions">
                <p style={{ textAlign: 'center' }}><i className="fas fa-exclamation-triangle"></i> This note can't be edited while still in the Trash.</p>
                <div className="smaller buttons">
                    <Button onClick={() => props.untrashNote(props.currentNote._id)} loadingIconSize="2rem">Restore note</Button>
                    <button className="caution" onClick={() => props.deleteNotePermanently(props.currentNote._id)}>Delete permanently</button>
                </div>
            </div>
        )
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
            {props.currentNote.trash
                ? noteOptions()
                : <EditorToolbar controlStyle={controlStyle} editorState={editorState} />}
            {noteTitle()}
            <div className="Editable" onClick={focus}>
                <Editor
                    readOnly={props.currentNote.trash}
                    editorState={editorState}
                    blockRenderMap={extendedBlockRenderMap}
                    handleKeyCommand={handleKeyCommand}
                    placeholder="Enter some text..."
                    onChange={handleChange}
                    ref={editorRef}
                />
            </div>
            {props.unsavedChanges && <Button className="saveChanges" onClick={handleSubmit} loadingIconSize="2.5rem">Save Changes</Button>}
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