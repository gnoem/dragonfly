import { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function NoteEditor(props) {
    const [currentStyles, setCurrentStyles] = useState([]);
    const [edited, setEdited] = useState(false);
    const [editorState, setEditorState] = useState(
        props.currentNote ? EditorState.createWithContent(convertFromRaw(props.currentNote.content)) : () => EditorState.createEmpty()
    );
    const editorRef = useRef(null);
    useEffect(() => {
        if (props.currentNote) setEditorState(EditorState.createWithContent(convertFromRaw(props.currentNote.content)));
        else setEditorState(EditorState.createEmpty());
        setEdited(false);
    }, [props.currentNote]);
    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            setEdited(true);
            return 'handled';
        }
        return 'not-handled';
    }
    const controlStyle = (e, value) => {
        e.preventDefault(); // onMouseDown + e.preventDefault rather than onClick preserves focus state in text editor
        const newState = RichUtils.toggleInlineStyle(editorState, value);
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
        if (!editorRef.current.editor.contains(e.target)) setEditorState(EditorState.moveFocusToEnd(editorState))
    }
    const handleSubmit = async () => {
        const contentState = editorState.getCurrentContent();
        let ROUTE = props.currentNote ? '/edit/note' : '/add/note';
        const response = await fetch(ROUTE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: props.currentNote ? props.currentNote._id : props.user._id,
                content: convertToRaw(contentState)
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        setEdited(false);
        props.refreshData();
    }
    const handleChange = (state) => {
        setEditorState(state);
        if (edited) return;
        const inputTypes = ['insert-characters', 'backspace-character', 'insert-fragment', 'remove-range'];
        if (!inputTypes.includes(state.getLastChangeType())) return;
        setEdited(true);
    }
    return (
        <div className="NoteEditor">
            <EditorControls controlStyle={controlStyle} currentStyles={currentStyles} />
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
            <button onMouseDown={(e) => props.controlStyle(e, 'H1')}><i className="fas fa-heading"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'BOLD')}><i className="fas fa-bold"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'ITALIC')}><i className="fas fa-italic"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'UNDERLINE')}><i className="fas fa-underline"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'STRIKETHROUGH')}><i className="fas fa-strikethrough"></i></button>
            <hr />
            <button onMouseDown={(e) => props.controlStyle(e, 'UNDERLINE')}><i className="fas fa-align-left"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'UNDERLINE')}><i className="fas fa-align-center"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'UNDERLINE')}><i className="fas fa-align-right"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'UNDERLINE')}><i className="fas fa-align-justify"></i></button>
            <hr />
            <button onMouseDown={(e) => props.controlStyle(e, 'UNDERLINE')}><i className="fas fa-list-ul"></i></button>
            <button onMouseDown={(e) => props.controlStyle(e, 'UNDERLINE')}><i className="fas fa-list-ol"></i></button>
        </div>
    )
}