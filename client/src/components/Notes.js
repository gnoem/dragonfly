import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import ContextMenu from './ContextMenu';
import Dropdown from './Dropdown';
import Loading from './Loading';
import NotePreview from './NotePreview';
import NoteEditor from './NoteEditor';
import { elementHasParent, elementIsInArray } from '../utils';

export default function Notes(props) {
    const { view, user, notes } = props;
    const [currentNote, setCurrentNote] = useState(notes[0]);
    const [currentNoteUpdated, setCurrentNoteUpdate] = useState(false); // set equal to _id
    const [newestNote, setNewestNote] = useState(null);
    const [addingNewNote, setAddingNewNote] = useState(false);
    const [tempNotePreview, setTempNotePreview] = useState('New note');
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [submitEditorState, setSubmitEditorState] = useState(false);
    const [sortTags, setSortTags] = useState('all');
    const [miniMenu, setMiniMenu] = useState(false);
    const [modalObject, setModalObject] = useState(false);
    const modalContent = useRef(null);
    const miniMenuRef = useRef(null);
    const getIndex = (id) => {
        return notes.findIndex(note => id === note._id);
    }
    const usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    }
    const prevNotesCount = usePrevious(notes.length);
    const prevView = usePrevious(view);
    //const prevNoteId = usePrevious(currentNote._id);
    useEffect(() => {
        /* let firstNote = notes[0];
        if (!notes.length) firstNote = false; // */
        setCurrentNote(false);
        setAddingNewNote(false);
        setTempNotePreview('New note');
    // do not want this firing everytime note changes
    // eslint-disable-next-line
    }, [view]);
    useEffect(() => {
        setMiniMenu(false);
        if (!currentNote || !currentNote._id) return setCurrentNoteUpdate(false);
        setCurrentNoteUpdate(currentNote._id);
    // don't need currentNote as a dependency, only currentNote._id
    // eslint-disable-next-line
    }, [currentNote?._id]);
    useEffect(() => {
        if (prevView !== view) return; // if notes.length changed because user switched view, return
        if (prevNotesCount < notes.length) { // a note has been added
            if (!newestNote) return;
            if (!currentNote) return; // to fix mid-CREATE-switch-to-no-note-selected-but-save-changes bug
            setCurrentNote(notes[getIndex(newestNote)]);
            setNewestNote(null);
        }
        if (prevNotesCount > notes.length) { // a note has been deleted (or removed via unstar, etc.)
            // if deleted altogether, behavior should have already been specified in deleteNote()
            // if removed e.g. via unstar, setCurrentNote(nextInLine)
            if (view === 'all-notes') return; // outside of 'all-notes', whether deletion or removal is irrelevant
            if (!currentNote) return;
            let index = getIndex(currentNote._id)+1;
            let nextInLine = notes[index] ? notes[index] : false;
            setCurrentNote(nextInLine);
        }
    // come back and figure out what needs to be in the dependency array
    // eslint-disable-next-line
    }, [notes.length]);
    /* useEffect(() => {
        // this is for when you edit a note directly and currentNote needs to update
        // maybe easier to just create a state called updateCurrentNote and set it to true/timestamp whenever currenet note needs to be updated
        if (prevNoteId !== currentNote._id) return; // to fix mid-edit-switch-to-different-note-but-save-changes bug
        if (prevNotesCount !== notes.length) return; // already specified what should happen if notes.length changes
        if (prevView !== view) return; // already specified what should happen if view changes
        if (!view.name) return; // this + next line is how to tell if within the same collections or tags section
        if (prevView && (prevView.name !== view.name)) return; // if so, notes array is changing but view ('collections'/'tags') is not
        setCurrentNote(notes[currentNoteIndex]);
        // mid-edit-switch-to-different-note-but-save-changes bug:
        // when you are in the middle of editing a note, then switch to another note and
        // opt to save changes, and then the note submit goes through, this gets called and it sets
        // current note BACK to the note you just switched away from

    // come back and figure out what needs to be in the dependency array
    // eslint-disable-next-line
    }, [notes]); */
    useEffect(() => {
        if (!currentNoteUpdated) return;
        else {
            setCurrentNote(notes[getIndex(currentNoteUpdated)]);
            return;
        }
    // don't need getIndex as a dependency
    // eslint-disable-next-line
    }, [notes, currentNoteUpdated]); // star/unstar, move to collection
    const handleClick = (e, beenWarned = false) => {
        e.preventDefault();
        if (!unsavedChanges || beenWarned) {
            if (beenWarned) setUnsavedChanges(false);
            setAddingNewNote(false);
            if (elementHasParent(e.target, '.NotePreview')) {
                let notePreview = e.target.classList.contains('NotePreview')
                    ? e.target
                    : e.target.closest('.NotePreview'); // if e.target is e.g. <h2>
                let noteId = notePreview.getAttribute('data-id');
                return setCurrentNote(notes[getIndex(noteId)]);
            }
            setCurrentNote(false);
            return;
        }
        const warnSaveChanges = () => { // next: () => handleClick(e, true)
            // maybe only warn save changes if trying to switch to a new note;
            // if (!elementHasParent(e.target, '.NotePreview')) return; // if NOT switching to a new note
            if (!unsavedChanges) return;
            const discardChanges = (next) => {
                gracefullyCloseModal(modalContent.current);
                next()(); // because 'next' returns a function (handleClickAgain) that returns a function
                // if you opt to save changes the function gets passed down one more layer (via setSubmitEditorState())
                // and is called when it gets to its final destination in NoteEditor.js
            }
            const saveChanges = (next) => {
                gracefullyCloseModal(modalContent.current);
                setSubmitEditorState(next); // handleSubmit will take next() as parameter if (props.submitEditorState === true)
                /* setSubmitEditorState(true); // this is happening second
                next(); // this is happening first */
            }
            // call handleClick again, with same (initial) e, but skipping "save changes" warning and carrying out the default click event
            const handleClickAgain = () => () => handleClick(e, true); // https://stackoverflow.com/questions/55621212/is-it-possible-to-react-usestate-in-react
            let content = (
                <div className="modalContent" ref={modalContent}>
                    <h2>Save changes?</h2>
                    It looks like you have unsaved changes. Would you like to save changes or discard?
                    <div className="buttons">
                        <button onClick={() => saveChanges(handleClickAgain)}>Save changes</button> {/* currentNote */}
                        <button className="greyed" onClick={() => discardChanges(handleClickAgain)}>Discard changes</button>
                    </div>
                </div>
            )
            setModalObject(content);
        }
        return warnSaveChanges();
    }
    const updateOnNoteCreation = (id) => {
        // setUnsavedChanges(false) happens directly in handleSubmit
        setAddingNewNote(false);
        setTempNotePreview('New note');
        setNewestNote(id);
    }
    const createNewNote = () => {
        // create new note
        setAddingNewNote(true);
        setCurrentNote({});
    }
    const confirmMoveToTrash = (id) => {
        const moveToTrash = async (e, id) => {
            e.preventDefault();
            setModalObject(content({ loadingIcon: true }));
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
            // todo: find NotePreview with id and shrink it down, with 200ms delay on refreshData()
            props.refreshData();
            setUnsavedChanges(false);
            gracefullyCloseModal(modalContent.current);
        }
        let content = (breakpoints = {
            loadingIcon: false
        }) => (
            <div className="modalContent" ref={modalContent}>
                <h2>Move to Trash</h2>
                Notes moved to the Trash folder will remain there for 30 days before being automatically deleted. You can customize this option in Settings.
                {breakpoints.loadingIcon
                    ?   <Loading />
                    :   <form onSubmit={(e) => moveToTrash(e, id)} className="buttons">
                            <button type="submit">Got it</button>
                            <button type="button" className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                        </form>
                    }
            </div>
        );
        setModalObject(content());
    }
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
    }
    const confirmPermanentDeletion = (id) => {
        const deleteNote = async (e, id) => {
            e.preventDefault();
            setModalObject(content({ loadingIcon: true }));
            const response = await fetch('/delete/note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success: true response from server');
            let index = getIndex(id)+1; // only if defined; if not, then notes.length has reached zero and needs message
            let nextInLine = notes[index] ? notes[index] : false;
            setCurrentNote(nextInLine);
            // todo: find NotePreview with id and shrink it down, with 200ms delay on refreshData()
            props.refreshData();
            setUnsavedChanges(false);
            gracefullyCloseModal(modalContent.current);
        }
        let content = (breakpoints = {
            loadingIcon: false
        }) => (
            <div className="modalContent" ref={modalContent}>
                <h2>Are you sure?</h2>
                You are about to permanently delete this note.
                {breakpoints.loadingIcon
                    ?   <Loading />
                    :   <form onSubmit={(e) => deleteNote(e, id)} className="buttons">
                            <button type="submit">Yes, I'm sure</button>
                            <button type="button" className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                        </form>
                    }
            </div>
        );
        setModalObject(content());
    }
    const starNote = async (id) => {
        if (!currentNote) return;
        // todo: if unsavedChanges, star note gets rid of save changes button. fix this
        // maybe just hide right sidebar for new notes
        const response = await fetch('/star/note', {
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
    }
    const gracefullyCloseModal = (modal) => {
        let container = modal.classList.contains('Modal')
            ? modal
            : modal.closest('.Modal');
        container.classList.add('goodbye');
        setTimeout(() => setModalObject(false), 200);
    }
    const noNoteSelected = () => {
        if (view === 'all-notes') {
            if (!notes.length) return (
                <div>
                    <h1>Hi there!</h1>
                    <p>You haven't added any notes.</p>
                    <button onClick={createNewNote}>Create a note</button>
                </div>
            );
        }
        if (view.type === 'tags') {
            if (!view.tags.length) return (
                <div>
                    <h1>Sort notes by tag</h1>
                    You can select as many tags as you want from the panel on the left.
                </div>
            );
        }
        if (notes.length) return (
            <div>
                <h1>No note selected!</h1>
                Select a note from the panel on the left to get started.
            </div>
        )
        return (
            <div>
                <h1>None found</h1>
                No notes found in this category.
            </div>
        )
    }
    const editOrDeleteCollection = (e, collectionName) => {
        // todo  dont have to wait for server to respond to refresh, e.g. collection list in the sidebar
        // just edit that data directly
        // shouldnt have to wait like an extra 2 seconds for the success response 
        if (view.type !== 'collection') return;
        // mini menu -> edit or delete
        const { top, right } = {
            top: e.clientY - 16,
            right: (window.innerWidth - e.clientX) + 16
        }
        const editCollection = () => {
            const handleEdit = async (e) => {
                e.preventDefault();
                setModalObject(content({
                    updatedNameError: null,
                    loadingIcon: true
                }));
                const inputCollectionName = e.target[0].value;
                const response = await fetch('/edit/collection', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        _id: user._id,
                        collectionName,
                        updatedName: inputCollectionName
                    })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) {
                    setModalObject(content({
                        updatedNameError: <span className="formError">{body.updatedNameError}</span>,
                        loadingIcon: false
                    }));
                    return;
                }
                props.refreshData();
                gracefullyCloseModal(modalContent.current);
                // change view
                props.updateView({ type: 'collection', name: inputCollectionName });
            }
            const initialBreakpoints = {
                updatedNameError: null,
                loadingIcon: false
            }
            let content = (breakpoints = initialBreakpoints) => {
                return (
                    <div className="modalContent" ref={modalContent}>
                        <h2>Edit collection</h2>
                        <form onSubmit={handleEdit} autoComplete="off">
                            <label htmlFor="updatedName">Edit collection name:</label>
                            <input
                                type="text"
                                name="updatedName"
                                className={breakpoints.updatedNameError ? 'nope' : ''}
                                onInput={() => setModalObject(content())} />
                            {breakpoints.updatedNameError}
                            {breakpoints.loadingIcon
                                ?   <div className="buttons"><Loading /></div>
                                :   <div className="buttons">
                                        <button type="submit">Submit</button>
                                        <button type="button" className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                                    </div>}
                        </form>
                    </div>
                );
            }
            setModalObject(content());
        }
        const deleteCollection = () => {
            const handleDelete = async (e) => {
                e.preventDefault();
                setModalObject(content({ loadingIcon: true }));
                const response = await fetch('/delete/collection', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ _id: user._id, collectionName })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success: true response from server');
                props.refreshData();
                gracefullyCloseModal(modalContent.current);
                // switch to the one above it; if none, switch to the one below it; else all-notes
                let nextInLine = () => {
                    let thisCollectionIndex = user.collections.indexOf(collectionName);
                    let nextCollection;
                    if (user.collections[thisCollectionIndex--]) {
                        nextCollection = user.collections[thisCollectionIndex--];
                        return { type: 'collection', name: nextCollection }
                    } else if (user.collections[thisCollectionIndex++]) {
                        nextCollection = user.collections[thisCollectionIndex++];
                        return { type: 'collection', name: nextCollection }
                    } else return 'all-notes';
                }
                props.updateView(nextInLine); // */
            }
            let content = (breakpoints = {
                loadingIcon: false
            }) => (
                <div className="modalContent" ref={modalContent}>
                    <h2>Are you sure?</h2>
                    Deleting the collection "{collectionName}" won't delete any notes, only the collection itself. This action cannot be undone.
                    {breakpoints.loadingIcon
                        ?   <Loading />
                        :   <form onSubmit={handleDelete} className="buttons">
                                <button type="submit">Yes, I'm sure</button>
                                <button type="button" className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Take me back</button>
                            </form>
                        }
                </div>
            );
            // NOTE: .buttons div is a form with onSubmit={handleDelete} because for some odd reason, if I try to call handleDelete
            // from a button onClick and then setModalObject to anything, modalObject immediately gets set to false and then
            // modalContent.current gets set to null, causing an error message at gracefullyCloseModal(modalContent.current)
            setModalObject(content());
        }
        let miniMenuContent = (
            <ul onClick={() => setMiniMenu(false)} style={{ top: `${top}px`, right: `${right}px` }} ref={miniMenuRef}>
                <li><button onClick={editCollection}>Edit collection</button></li>
                <li><button onClick={deleteCollection}>Delete collection</button></li>
            </ul>
        );
        setMiniMenu({ name: 'presentChildren', content: miniMenuContent });
    }
    const trashOptions = (e) => {
        if (view !== 'trash') return;
        const { top, right } = {
            top: e.clientY - 16,
            right: (window.innerWidth - e.clientX) + 16
        }
        const confirmEmptyTrash = () => {
            const emptyTrash = async () => {
                setModalObject(content({ loadingIcon: true }));
                const response = await fetch('/empty/trash', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ _id: user._id })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success: true response from server');
                props.refreshData();
                gracefullyCloseModal(modalContent.current);
            }
            let content = (breakpoints = {
                loadingIcon: false
            }) => {
                return (
                    <div className="modalContent" ref={modalContent}>
                        <h2>Are you sure?</h2>
                        If you proceed, all the notes in your Trash will be permanently erased. This action cannot be undone.
                        {breakpoints.loadingIcon
                            ?   <Loading />
                            :   <form onSubmit={emptyTrash} className="buttons">
                                    <button type="submit">Yes, I'm sure</button>
                                    <button type="button" className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                                </form>
                        }
                    </div>
                );
            }
            setModalObject(content());
        }
        let content = (
            <ul onClick={() => setMiniMenu(false)} style={{ top: `${top}px`, right: `${right}px` }} ref={miniMenuRef}>
                <li><button onClick={confirmEmptyTrash}>Empty Trash</button></li>
            </ul>
        );
        setMiniMenu({ name: 'presentChildren', content });
    }
    const listHeader = () => {
        let title, button = '';
        switch (view) {
            case 'all-notes': {
                title = 'All notes';
                button = (
                    <button className="newNote" onClick={createNewNote}>
                        <i className="fas fa-plus"></i>
                    </button>
                );
                break;
            }
            case 'starred-notes': {
                title = 'Starred notes';
                break;
            }
            case 'trash': {
                title = 'Trash';
                button = (
                    <button className="viewOptions" onClick={(e) => trashOptions(e)}>
                        <i className="fas fa-ellipsis-v"></i>
                    </button>
                );
                break;
            }
            default: {
                if (view.type === 'collection') {
                    title = (
                        <span className="collectionHeader">
                            <span>COLLECTION</span>
                            <span>{view.name}</span>
                        </span>
                    );
                    button = (
                        <button className="viewOptions" onClick={(e) => editOrDeleteCollection(e, view.name)}>
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                    );
                } else if (view.type === 'tags') {
                    title = '';
                    button = '';
                } else {
                    title = 'All notes';
                    button = (
                        <button className="newNote" onClick={createNewNote}>
                            <i className="fas fa-plus"></i>
                        </button>
                    );
                }
                break;
            }
        }
        return (
            <div className="Header" hidden={view.type === 'tags'}>
                <div className="h1"><h1>{title}</h1></div>
                <div className="button">{button}</div>
            </div>
        )
    }
    const listFooter = () => {
        if (notes.length) return (
            <div className="endofnotes">
                <span className="nowrap">You've reached the</span>
                <span className="nowrap">end of your notes.</span>
            </div>
        )
        if ((view === 'all-notes') && addingNewNote) return null;
        if ((view.type === 'tags') && (!view.tags.length)) return null;
        return (
            <div className="endofnotes" style={{ marginTop: '1rem' }}>None found</div>
        )
    }
    const generateNotesList = () => {
        let notesList = [];
        for (let i = 0; i < notes.length; i++) {
            notesList.push(<NotePreview
                key={notes[i]._id}
                current={currentNote?._id}
                temp={false}
                {...notes[i]}
            />)
        }
        return notesList;
    }
    const createTag = (e, fromMiniMenu = false) => {
        e.preventDefault();
        const handleSubmit = async (e) => {
            e.preventDefault();
            setModalObject(content({
                tagNameError: null,
                loadingIcon: true   
            }));
            const tagName = e.target[0].value;
            const response = await fetch('/create/tag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: user._id, tagName })
            });
            const body = await response.json();
            if (!body) return;
            if (!body.success) {
                setModalObject(content({
                    tagNameError: <span className="formError">{body.tagNameError}</span>,
                    loadingIcon: false
                }));
                return;
            }
            gracefullyCloseModal(modalContent.current);
            props.refreshData();
            if (fromMiniMenu) return;
            props.updateView({ type: 'tags', tags: [tagName] });
        }
        let content = (breakpoints = {
            tagNameError: null,
            loadingIcon: false
        }) => {
            return (
                <div className="modalContent" ref={modalContent}>
                    <h2>Create a new tag</h2>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <label htmlFor="collectionName">Enter a name for your tag:</label>
                        <input
                            type="text"
                            name="tagName"
                            className={breakpoints.tagNameError ? 'nope' : ''}
                            onInput={(e) => e.target.className = ''} />
                        {breakpoints.tagNameError}
                        {breakpoints.loadingIcon
                            ?   <div className="buttons"><Loading /></div>
                            :   <div className="buttons">
                                    <button type="submit">Submit</button>
                                    <button type="button" className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                                </div>}
                    </form>
                </div>
            )
        }
        setModalObject(content());
    }
    const showingTags = () => {
        if (view.type !== 'tags') return;
        let noTagsSelected = view.tags.length === 0;
        const tagList = () => {
            const newTagButton = (
                <button onClick={createTag} onContextMenu={(e) => e.preventDefault()} key="createTag" className="tag createTag">
                    Create new tag
                </button>
            )
            if (!user.tags.length) return newTagButton;
            const tagContextMenu = (e, tagName) => {
                e.preventDefault();
                const { top, right } = {
                    top: e.clientY,
                    right: (window.innerWidth - e.clientX)
                }
                const editTag = () => {
                    const handleEdit = async (e) => {
                        e.preventDefault();
                        setModalObject(content({
                            updatedNameError: null,
                            loadingIcon: true
                        }));
                        const updatedName = e.target[0].value;
                        const response = await fetch('/edit/tag', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                _id: user._id,
                                tagName,
                                updatedName
                            })
                        });
                        const body = await response.json();
                        if (!body) return console.log('no response from server');
                        if (!body.success) {
                            setModalObject(content({
                                updatedNameError: <span className="formError">{body.updatedNameError}</span>,
                                loadingIcon: false
                            }));
                            return;
                        }
                        props.refreshData();
                        gracefullyCloseModal(modalContent.current);
                        props.updateView({ type: 'tags', tags: [updatedName] });
                    }
                    const initialBreakpoints = {
                        updatedNameError: null,
                        loadingIcon: false
                    }
                    let content = (breakpoints = initialBreakpoints) => {
                        return (
                            <div className="modalContent" ref={modalContent}>
                                <h2>Edit tag</h2>
                                <form onSubmit={handleEdit} autoComplete="off">
                                    <label htmlFor="updatedName">Edit tag name:</label>
                                    <input
                                        type="text"
                                        name="updatedName"
                                        defaultValue={tagName}
                                        className={breakpoints.updatedNameError ? 'nope' : ''}
                                        onInput={() => setModalObject(content())} />
                                    {breakpoints.updatedNameError}
                                    {breakpoints.loadingIcon
                                        ?   <div className="buttons"><Loading /></div>
                                        :   <div className="buttons">
                                                <button type="submit">Submit</button>
                                                <button type="button" className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                                            </div>}
                                </form>
                            </div>
                        );
                    }
                    setModalObject(content());
                }
                const confirmDeleteTag = () => {
                    const deleteTag = async () => {
                        setModalObject(content({ loadingIcon: true }));
                        const response = await fetch('/delete/tag', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ _id: user._id, tagName })
                        });
                        const body = await response.json();
                        if (!body) return console.log('no response from server');
                        if (!body.success) return console.log('no success: true response from server');
                        props.refreshData();
                        gracefullyCloseModal(modalContent.current);
                    }
                    let content = (breakpoints = {
                        loadingIcon: false
                    }) => (
                        <div className="modalContent" ref={modalContent}>
                            <h2>Are you sure?</h2>
                            Deleting the tag "{tagName}" won't delete any notes, only the tag itself. This action cannot be undone.
                            {breakpoints.loadingIcon
                                ?   <Loading />
                                :   <form onSubmit={deleteTag} className="buttons">
                                        <button type="submit">Yes, I'm sure</button>
                                        <button type="button" className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                                    </form>
                                }
                        </div>
                    );
                    setModalObject(content());
                }
                let content = (
                    <ul onClick={() => setMiniMenu(false)} className="smol" style={{ top: `${top}px`, right: `${right}px` }} ref={miniMenuRef}>
                        <li><button className="edit" onClick={editTag}>Edit tag</button></li>
                        <li><button className="delete" onClick={confirmDeleteTag}>Delete tag</button></li>
                    </ul>
                )
                setMiniMenu({ name: 'presentChildren', content });
            }
            const toggleTag = (tagName) => {
                const updatedArray = (prevView) => {
                    let currentViewTags = [...prevView.tags];
                    if (!elementIsInArray(tagName, currentViewTags)) {
                        currentViewTags.push(tagName);
                        return currentViewTags;
                    }
                    let index = currentViewTags.indexOf(tagName);
                    currentViewTags.splice(index, 1);
                    return currentViewTags;
                }
                props.updateView(prevView => ({
                    type: 'tags',
                    tags: updatedArray(prevView),
                    sortTags
                }));
                return;
            }
            let tagArray = [];
            for (let i = 0; i < user.tags.length; i++) {
                let thisTag = user.tags[i];
                let isSelected = elementIsInArray(thisTag, view.tags);
                tagArray.push(
                    <button
                      onClick={() => toggleTag(thisTag)}
                      onContextMenu={(e) => tagContextMenu(e, thisTag)}
                      key={`showingTag-${thisTag}`}
                      className={`tag${isSelected ? ' hasTag' : ''}`}>
                        {thisTag}
                    </button>
                );
            }
            tagArray.push(newTagButton);
            return tagArray;
        }
        const updateSortTags = (value) => {
            setSortTags(value);
            props.updateView(prevView => ({ ...prevView, sortTags: value }));
        }
        return (
            <div className="showingTags">
                <span className="hint">Right-click on a tag for more options.</span>
                <h2>{noTagsSelected ? 'View' : 'Viewing'} notes tagged:</h2>
                <div className="tagsGrid">{tagList()}</div>
                <div className="sortTagOptions">
                    Find notes with
                        <Dropdown display={sortTags}>
                            <li><button onClick={() => updateSortTags('all')}>all</button></li>
                            <li><button onClick={() => updateSortTags('any')}>any</button></li>
                        </Dropdown>
                    of the selected tags.
                </div>
            </div>
        )
    }
    const updateMiniMenu = (e, name) => {
        setMiniMenu({
            name,
            position: {
                top: e.clientY - 16,
                right: (window.innerWidth - e.clientX) + 16
            }
        });
    }
    return (
        <div className="Notes">
            <Modal exitModal={gracefullyCloseModal} content={modalObject} />
            {miniMenu.content && <ContextMenu menu={miniMenu} updateMiniMenu={setMiniMenu} />}
            <div className="List">
                {listHeader()}
                <div className="NotePreviews" onClick={handleClick}>
                    {showingTags()}
                    {addingNewNote && <NotePreview temp={true} title={tempNotePreview} />}
                    {generateNotesList()}
                    {listFooter()}
                </div>
            </div>
            <div className="Editor">
                {currentNote
                    ?   <NoteEditor
                            user={user}
                            currentNote={currentNote}
                            unsavedChanges={unsavedChanges}
                            updateUnsavedChanges={setUnsavedChanges}
                            updatePreview={setTempNotePreview}
                            updateOnNoteCreation={updateOnNoteCreation}
                            submitEditorState={submitEditorState} // lets Editor know to save changes
                            updateSubmitEditorState={setSubmitEditorState} // update back to false
                            refreshData={props.refreshData}
                            untrashNote={untrashNote}
                            deleteNotePermanently={confirmPermanentDeletion}
                        />
                    :   noNoteSelected()
                }
            </div>
            {currentNote && !currentNote.trash
                ?   <div className="Options">
                        <div className="OptionItem">
                            <button className={currentNote.starred ? 'hasStar' : null} onClick={() => starNote(currentNote._id)}>
                                <i className="fas fa-star"></i>
                                <span className="tooltip">{currentNote.starred ? 'Unstar' : 'Add star'}</span>
                            </button>
                        </div>
                        <div className="OptionItem">
                            <button onClick={(e) => updateMiniMenu(e, 'moveNoteToCollection')}>
                                <i className="fas fa-book"></i>
                                <span className="tooltip">Move to collection</span>
                            </button>
                            <ContextMenu
                                menu={miniMenu}
                                user={user}
                                currentNote={currentNote}
                                updateMiniMenu={setMiniMenu}
                                updateModalObject={setModalObject}
                                gracefullyCloseModal={gracefullyCloseModal}
                                refreshData={props.refreshData} />
                        </div>
                        <div className="OptionItem">
                            <button onClick={(e) => updateMiniMenu(e, 'tagNote')}>
                                <i className="fas fa-tags"></i>
                                <span className="tooltip">Add tags</span>
                            </button>
                            <ContextMenu
                                menu={miniMenu}
                                user={user}
                                currentNote={currentNote}
                                createTag={createTag}
                                updateMiniMenu={setMiniMenu}
                                updateModalObject={setModalObject}
                                gracefullyCloseModal={gracefullyCloseModal}
                                refreshData={props.refreshData} />
                        </div>
                        <div className="OptionItem">
                            <button onClick={view === 'trash' ? () => confirmPermanentDeletion(currentNote._id) : () => confirmMoveToTrash(currentNote._id)}>
                                <i className="fas fa-trash"></i>
                                <span className="tooltip">Move to Trash</span>
                            </button>
                        </div>
                    </div>
                :   ''
            }
        </div>
    )
}