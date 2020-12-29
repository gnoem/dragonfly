import { useState, useRef } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function NoteEditor() {
    const [currentStyles, setCurrentStyles] = useState([]);
    const [editorState, setEditorState] = useState(
        () => EditorState.createEmpty(),
    );
    const editorRef = useRef(null);
    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
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
    const focus = () => {
        editorRef.current.focus();
    }
    return (
        <div className="NoteEditor">
            <EditorControls controlStyle={controlStyle} currentStyles={currentStyles} />
            <div className="Editable" onClick={focus}>
                <Editor
                    editorState={editorState}
                    handleKeyCommand={handleKeyCommand}
                    placeholder="Enter some text..."
                    onChange={setEditorState}
                    ref={editorRef}
                />
            </div>
        </div>
    )
}

function EditorControls(props) {
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