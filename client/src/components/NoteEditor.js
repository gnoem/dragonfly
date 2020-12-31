import { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function NoteEditor(props) {
    const [currentStyles, setCurrentStyles] = useState([]);
    const [edited, setEdited] = useState(false);
    const [editorTitle, setEditorTitle] = useState('');
    const [editorState, setEditorState] = useState(
        props.currentNote.content ? EditorState.createWithContent(convertFromRaw(props.currentNote.content)) : () => EditorState.createEmpty()
    );
    const editorRef = useRef(null);
    const titleInput = useRef(null);
    useEffect(() => {
        if (props.currentNote.content) {
            setEditorState(EditorState.createWithContent(convertFromRaw(props.currentNote.content)));
            setEditorTitle(props.currentNote.title);
        }
        else {
            setEditorState(EditorState.createEmpty());
            setEditorTitle('');
        }
        setEdited(false);
    }, [props.currentNote.content, props.currentNote.title]);
    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            setEdited(true);
            return 'handled';
        }
        return 'not-handled';
    }
    const controlStyle = (e, type, value) => {
        e.preventDefault(); // onMouseDown + e.preventDefault rather than onClick preserves focus state in text editor
        const newState = (type === 'inline') ? RichUtils.toggleInlineStyle(editorState, value) : RichUtils.toggleBlockType(editorState, value);
        setEditorState(newState);
        if (!currentStyles.includes(value)) {
            setCurrentStyles([...currentStyles, value]);
        }
        else {
            let index = currentStyles.indexOf(value);
            if (index > -1) currentStyles.splice(index, 1);
        }
    }
    const focus = (e) => {
        //editorRef.current.focus();
        if (!editorRef.current.editor.contains(e.target)) setEditorState(EditorState.moveFocusToEnd(editorState));
    }
    const handleSubmit = async () => {
        const contentState = editorState.getCurrentContent();
        let ROUTE = props.currentNote.content ? '/edit/note' : '/add/note';
        const response = await fetch(ROUTE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: props.currentNote.content ? props.currentNote._id : props.user._id,
                title: editorTitle,
                content: convertToRaw(contentState)
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        setEdited(false);
        props.refreshData();
        if (body.id) props.updateOnNoteSubmit(body.id); // only get body.id if creating note, not editing note
    }
    const handleChange = (state) => {
        setEditorState(state);
        if (edited) return;
        const inputTypes = ['insert-characters', 'backspace-character', 'insert-fragment', 'remove-range'];
        if (!inputTypes.includes(state.getLastChangeType())) return;
        setEdited(true);
        props.updateUnsavedChanges(true); // tell parent component there are unsaved changes
    }
    const noteTitle = () => {
        const title = props.currentNote.content ? props.currentNote.title : '';
        const handleInput = (e) => {
            if (!edited) setEdited(true);
            setEditorTitle(e.target.value);
            props.updateUnsavedChanges(true); // tell parent component there are unsaved changes
        }
        const updatePreview = (e) => {
            
        }
        return (
            <input type="text" ref={titleInput} key={title} defaultValue={title} placeholder="Add a title" onInput={handleInput} onChange={updatePreview} />
        )
    }
    return (
        <div className="NoteEditor">
            <EditorControls controlStyle={controlStyle} currentStyles={currentStyles} />
            {noteTitle()}
            <div className="Editable" onClick={focus}>
                <Editor
                    editorState={editorState}
                    handleKeyCommand={handleKeyCommand}
                    placeholder="Enter some text..."
                    onChange={handleChange}
                    ref={editorRef}
                />
            </div>
            {edited && <button onClick={handleSubmit}>Save Changes</button>}
        </div>
    )
}

function EditorControls(props) {
    //eslint-disable-next-line
    const isStyleActive = (style) => {
        if (props.currentStyles.includes(style)) return 'active';
        else return false;
    }
    return (
        <div className="EditorControls">
            <button onMouseDown={(e) => props.controlStyle(e, 'inline', 'BOLD')}><i className="fas fa-bold"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'inline', 'ITALIC')}><i className="fas fa-italic"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'inline', 'UNDERLINE')}><i className="fas fa-underline"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'inline', 'STRIKETHROUGH')}><i className="fas fa-strikethrough"></i></button>
            <hr />
            <button onMouseDown={(e) => props.controlStyle(e, 'block', 'ALIGN-LEFT')}><i className="fas fa-align-left"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'block', 'ALIGNCENTER')}><i className="fas fa-align-center"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'block', 'UNDERLINE')}><i className="fas fa-align-right"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'block', 'UNDERLINE')}><i className="fas fa-align-justify"></i></button>
            <hr />
            <button onMouseDown={(e) => props.controlStyle(e, 'block', 'blockquote')}><i className="fas fa-quote-left"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'block', 'unordered-list-item')}><i className="fas fa-list-ul"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'block', 'ordered-list-item')}><i className="fas fa-list-ol"></i></button>
        </div>
    )
}