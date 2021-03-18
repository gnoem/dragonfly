import { useState, useEffect, useRef } from 'react';
import { Button } from '../../Form';
import Immutable from 'immutable';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, DefaultDraftBlockRenderMap } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Note } from '../../../api';

export const EditorSpace = (props) => {
    const { user, currentNote, unsavedChanges } = props;
    const newNote = !currentNote._id;
    const [editorTitle, setEditorTitle] = useState(newNote ? '' : currentNote.title);
    const [editorState, setEditorState] = useState(
        newNote ? () => EditorState.createEmpty() : EditorState.createWithContent(convertFromRaw(currentNote.content))
    );
    const [showSaveChangesButton, setShowSaveChangesButton] = useState(false);
    const [simulateSaveButtonClick, setSimulateSaveButtonClick] = useState(false); // prop for button, to simulate click event after Ctrl + S
    const isMounted = useRef(false);
    useEffect(() => {
        isMounted.current = true;
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
            isMounted.current = false;
        }
    }, []);
    useEffect(() => {
        if (unsavedChanges) setShowSaveChangesButton(true);
    }, [unsavedChanges]);
    const handleSubmit = async (optionalCallback) => {
        const contentState = editorState.getCurrentContent();
        const defaultCallback = () => {
            props.updateUnsavedChanges(false);
            if (!newNote && simulateSaveButtonClick) setSimulateSaveButtonClick(false);
            // ^^^ error (can't perform state update on unmounted component) if i don't include !newNote
            if (newNote) props.updateCurrentNote(null); //idk why but this feels right
            // when saving a new note, close the editor afterwards
            // won't happen when editing existing notes - you open something up to work on it
            // todo come back to this
            props.refreshData();
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
            props.updateUnsavedChanges(false);
            props.updateCurrentNote(null);
            props.refreshData();
        }
        props.updateModal('warnUnsavedChanges', 'form', { saveChanges: () => handleSubmit(closeEditor), discardChanges: closeEditor });
    }
    const handleExit = () => {
        if (unsavedChanges) return warnUnsavedChanges();
        props.updateCurrentNote(null);
    }
    const inherit = {
        ...props,
        newNote,
        editorTitle, updateEditorTitle: setEditorTitle,
        editorState, updateEditorState: setEditorState,
    }
    return (
        <>
            <button className="giantCornerButton exit" onClick={handleExit}></button>
            <div className="NoteEditor">
                {currentNote.trash ? <TrashOptions {...inherit} /> : <EditorToolbar {...inherit} />}
                <NoteTitle {...inherit} />
                <NoteBody {...inherit} />
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
        </>
    );
}

const TrashOptions = (props) => {
    const { currentNote } = props;
    const restoreNote = () => {
        Note.trashNote(currentNote._id).then(props.refreshData); // todo keep an eye on this
        // choosing not to include updateCurrentNote(null) as callback in case user wants to start editing immediately after removing from trash
    }
    const deletePermanently = () => {
        props.updateModal('deleteNotePermanently', 'form', { _id: currentNote._id, onSuccess: props.refreshData });
    }
    return (
        <div className="noteIsInTrash">
            <i className="giantIcon fas fa-exclamation-triangle"></i>
            <p>This note can't be edited while it is in the Trash.</p>
            <div className="smaller buttons">
                <Button onClick={restoreNote}
                        showLoadingIcon={true}>
                    Restore note
                </Button>
                <button className="caution" onClick={deletePermanently}>Delete permanently</button>
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