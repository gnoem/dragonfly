import { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function NoteEditor(props) {
    const newNote = !props.currentNote.content;
    const [editorTitle, setEditorTitle] = useState('');
    const [editorState, setEditorState] = useState(
        newNote ? () => EditorState.createEmpty() : EditorState.createWithContent(convertFromRaw(props.currentNote.content))
    );
    const [inlineStyles, setInlineStyles] = useState([]);
    const [blockType, setBlockType] = useState(false);
    const titleInput = useRef(null);
    const editorRef = useRef(null);
    useEffect(() => {
        console.log(props.currentNote._id); // this is changing immediately!
        //debugger;
    }, [props.currentNote._id]);
    useEffect(() => {
        console.log('next(): '+props.submitEditorState);
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
        if (type === 'block') return setBlockType(value);
        if (!inlineStyles.includes(value)) {
            setInlineStyles([...inlineStyles, value]);
        } else {
            let index = inlineStyles.indexOf(value);
            if (index > -1) inlineStyles.splice(index, 1);
        }
    }
    const noteTitle = () => {
        const title = newNote ? '' : props.currentNote.title;
        const handleInput = (e) => {
            setEditorTitle(e.target.value);
            props.updateUnsavedChanges(true);
            if (newNote) props.updatePreview(e.target.value);
        }
        return (
            <input type="text" ref={titleInput} key={title} defaultValue={title} placeholder="Add a title" onInput={handleInput} />
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
        console.log('form submitted for: '+props.currentNote._id);
        const contentState = editorState.getCurrentContent();
        let ROUTE = newNote ? '/add/note' : '/edit/note';
        /* console.dir({
            id: newNote ? props.user._id : props.currentNote._id,
            title: editorTitle,
            content: convertToRaw(contentState)
        }); // */
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
    return (
        <div className="NoteEditor">
            <EditorControls controlStyle={controlStyle} inlineStyles={inlineStyles} blockType={blockType} />
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
            {props.unsavedChanges && <button onClick={handleSubmit}>Save Changes</button>}
        </div>
    )
}

function EditorControls(props) {
    const isInlineStyleActive = (style) => {
        return '';
        //eslint-disable-next-line
        if (props.inlineStyles.includes(style)) return 'active';
        return '';
    }
    //eslint-disable-next-line
    const isBlockTypeActive = (type) => {
        if (props.blockType === type) return 'active';
        return '';
    }
    return (
        <div className="EditorControls">
            <button className={isInlineStyleActive('BOLD')} onMouseDown={(e) => props.controlStyle(e, 'inline', 'BOLD')}><i className="fas fa-bold"></i></button>
            <button className={isInlineStyleActive('ITALIC')} onMouseDown={(e) => props.controlStyle(e, 'inline', 'ITALIC')}><i className="fas fa-italic"></i></button>
            <button className={isInlineStyleActive('UNDERLINE')} onMouseDown={(e) => props.controlStyle(e, 'inline', 'UNDERLINE')}><i className="fas fa-underline"></i></button>
            <button className={isInlineStyleActive('STRIKETHROUGH')} onMouseDown={(e) => props.controlStyle(e, 'inline', 'STRIKETHROUGH')}><i className="fas fa-strikethrough"></i></button>
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