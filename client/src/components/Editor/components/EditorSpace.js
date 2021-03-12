import { useState, useEffect, useRef } from 'react';
import Button from '../../Button';
import Immutable from 'immutable';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, DefaultDraftBlockRenderMap } from 'draft-js';
import 'draft-js/dist/Draft.css';

export const EditorSpace = (props) => {
    const { user, currentNote, unsavedChanges } = props;
    const newNote = !currentNote.content;
    const [editorTitle, setEditorTitle] = useState(newNote ? '' : currentNote.title);
    const [editorState, setEditorState] = useState(
        newNote ? () => EditorState.createEmpty() : EditorState.createWithContent(convertFromRaw(currentNote.content))
    );
    const [saveChangesButtonClick, setSaveChangesButtonClick] = useState(false); // prop for button, to simulate click event after Ctrl + S
    useEffect(() => {
        const keys = [];
        const keydown = (e) => {
            keys[e.key] = true;
            if (keys['Meta'] && keys['s']) {
                e.preventDefault(); // hides automatic dialog but also prevents keyup event listener(?), hence the next 2 lines
                keys['Meta'] = false;
                keys['s'] = false;
                setSaveChangesButtonClick(true);
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
    const handleSubmit = async () => {
        console.log('handling submit');
        if (!unsavedChanges) return;
        const contentState = editorState.getCurrentContent();
        console.log(editorTitle);
        console.log(contentState);
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
        if (saveChangesButtonClick) setSaveChangesButtonClick(false);
        props.refreshData();
        if (body.id) props.updateCurrentNote(false); // only get id from server when creating new note
    }
    const inherit = {
        ...props,
        newNote,
        editorTitle, updateEditorTitle: setEditorTitle,
        editorState, updateEditorState: setEditorState,
    }
    return (
        <div className="NoteEditor">
            {currentNote.trash ? <TrashOptions {...inherit} /> : <EditorToolbar {...inherit} />}
            <NoteTitle {...inherit} />
            <NoteBody {...inherit} />
            {unsavedChanges && <div className="saveChanges">
                <Button onClick={handleSubmit} isClicked={saveChangesButtonClick} loadingIconSize="2.5rem">Save Changes</Button>
            </div>}
        </div>
    );
}

const TrashOptions = () => {
    return (
        <div className="noteIsInTrash">
            <i className="giantIcon fas fa-exclamation-triangle"></i>
            <p>This note can't be edited while still in the Trash.</p>
            <div className="smaller buttons">
                <Button onClick={() => console.dir('todo restore note')} loadingIconSize="2rem">Restore note</Button>
                <button className="caution" onClick={() => console.dir('todo confirm delete')}>Delete permanently</button>
            </div>
        </div>
    );
}

const EditorToolbar = (props) => {
    const { editorState } = props;
    // todo if focus is on title input, do nothing
    const controlStyle = (e, type, value) => {
        e.preventDefault(); // onMouseDown + e.preventDefault rather than onClick preserves focus state in text editor
        const newState = (type === 'inline')
            ?   RichUtils.toggleInlineStyle(editorState, value)
            :   RichUtils.toggleBlockType(editorState, value);
        props.updateEditorState(newState);
    }
    const isInlineStyleActive = (style) => {
        const inlineStyle = editorState.getCurrentInlineStyle();
        return inlineStyle.has(style) ? 'active' : '';
    }
    const getBlockType = () => {
        const startKey = editorState.getSelection().getStartKey();
        const selectedBlockType = editorState
            .getCurrentContent()
            .getBlockForKey(startKey)
            .getType();
        return selectedBlockType;
    }
    const isBlockTypeActive = (type) => {
        return (type === getBlockType())
            ? 'active'
            : '';
    }
    return (
        <div className="EditorToolbar">
            <div className="group">
                <button className={isInlineStyleActive('BOLD')} onMouseDown={(e) => controlStyle(e, 'inline', 'BOLD')}><i className="fas fa-bold"></i></button>
                <button className={isInlineStyleActive('ITALIC')} onMouseDown={(e) => controlStyle(e, 'inline', 'ITALIC')}><i className="fas fa-italic"></i></button>
                <button className={isInlineStyleActive('UNDERLINE')} onMouseDown={(e) => controlStyle(e, 'inline', 'UNDERLINE')}><i className="fas fa-underline"></i></button>
                <button className={isInlineStyleActive('STRIKETHROUGH')} onMouseDown={(e) => controlStyle(e, 'inline', 'STRIKETHROUGH')}><i className="fas fa-strikethrough"></i></button>
            </div>
            <hr />
            <div className="group">
                <button className={isBlockTypeActive('ALIGN-LEFT')} onMouseDown={(e) => controlStyle(e, 'block', 'ALIGN-LEFT')}><i className="fas fa-align-left"></i></button>
                <button className={isBlockTypeActive('ALIGN-CENTER')} onMouseDown={(e) => controlStyle(e, 'block', 'ALIGN-CENTER')}><i className="fas fa-align-center"></i></button>
                <button className={isBlockTypeActive('ALIGN-RIGHT')} onMouseDown={(e) => controlStyle(e, 'block', 'ALIGN-RIGHT')}><i className="fas fa-align-right"></i></button>
                <button className={isBlockTypeActive('ALIGN-JUSTIFY')} onMouseDown={(e) => controlStyle(e, 'block', 'ALIGN-JUSTIFY')}><i className="fas fa-align-justify"></i></button>
            </div>
            <hr />
            <div className="group">
                <button className={isBlockTypeActive('blockquote')} onMouseDown={(e) => controlStyle(e, 'block', 'blockquote')}><i className="fas fa-quote-left"></i></button>
                <button className={isBlockTypeActive('unordered-list-item')} onMouseDown={(e) => controlStyle(e, 'block', 'unordered-list-item')}><i className="fas fa-list-ul"></i></button>
                <button className={isBlockTypeActive('ordered-list-item')} onMouseDown={(e) => controlStyle(e, 'block', 'ordered-list-item')}><i className="fas fa-list-ol"></i></button>
            </div>
        </div>
    );
}

const NoteTitle = (props) => {
    const { newNote, currentNote } = props;
    useEffect(() => {
        if (newNote) titleInput?.current?.focus();
    }, [newNote]);
    const titleInput = useRef(null);
    const title = newNote ? '' : currentNote.title;
    const handleInput = (e) => {
        props.updateEditorTitle(e.target.value);
        props.updateUnsavedChanges(true);
    }
    return <input
        type="text"
        readOnly={currentNote.trash}
        ref={titleInput}
        defaultValue={title}
        placeholder="Add a title"
        onInput={handleInput}
    />;
}

const NoteBody = (props) => {
    const { currentNote, editorState, unsavedChanges } = props;
    const editorRef = useRef(null);
    const handleChange = (state) => {
        props.updateEditorState(state);
        if (unsavedChanges) return;
        const inputTypes = ['insert-characters', 'backspace-character', 'insert-fragment', 'remove-range'];
        if (!inputTypes.includes(state.getLastChangeType())) return;
        props.updateUnsavedChanges(true);
    }
    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            props.updateEditorState(newState);
            props.updateUnsavedChanges(true);
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