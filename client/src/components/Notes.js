import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import MiniMenu from './MiniMenu';
import NotePreview from './NotePreview';
import NoteEditor from './NoteEditor';
import { elementHasParent } from '../utils';

export default function Notes(props) {
    const { view, user, notes } = props;
    const [currentNote, setCurrentNote] = useState(notes[0]);
    const [currentNoteUpdated, setCurrentNoteUpdate] = useState(false);
    const [newestNote, setNewestNote] = useState(null);
    const [addingNewNote, setAddingNewNote] = useState(false);
    const [tempNotePreview, setTempNotePreview] = useState('New note');
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [submitEditorState, setSubmitEditorState] = useState(false);
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
        let firstNote = notes[0];
        if (!notes.length) firstNote = false;
        setCurrentNote(firstNote); // not necessarily
        setAddingNewNote(false);
        setTempNotePreview('New note');
    // do not want this firing everytime note changes
    // eslint-disable-next-line
    }, [view]);
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
            if (view !== 'all-notes') { // outside of 'all-notes', whether deletion or removal is irrelevant
                let index = getIndex(currentNote._id)+1;
                let nextInLine = notes[index] ? notes[index] : false;
                setCurrentNote(nextInLine);
            }
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

        console.log('signal to update currentNote: '+currentNoteUpdated);
        if (!currentNoteUpdated) return;
        //console.dir(notes[getIndex(currentNoteUpdated)].collection); // still reading old "collection" value
    }, [currentNoteUpdated]);
    useEffect(() => {
        if (!currentNoteUpdated) return;
        if (currentNoteUpdated) {
            console.log('updating current note');
            //const currentNoteIndex = currentNote ? getIndex(currentNote._id) : 0;
            setCurrentNote(notes[getIndex(currentNoteUpdated)]);
            //console.dir(notes[getIndex(currentNoteUpdated)].collection);
            setCurrentNoteUpdate(false);
            return;
        }
    }, [notes]); // star/unstar, move to collection
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
            const content = (
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
    const confirmDeletion = (id) => {
        const deleteNote = async (id) => {
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
        const content = (
            <div className="modalContent" ref={modalContent}>
                <h2>Are you sure?</h2>
                This action can't be undone.
                <div className="buttons">
                    <button onClick={() => deleteNote(id)}>Yes, I'm sure</button>
                    <button className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                </div>
            </div>
        )
        setModalObject(content);
    }
    const starNote = async (id) => {
        // todo: if unsavedChanges, star note gets rid of save changes button. fix this
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
        // and also refresh current note
        if (view !== 'starred-notes') setCurrentNoteUpdate(notes[getIndex(id)]); // need this to be up to date though
        // if in starred notes, then clicking star will cause the note to disappear and then currentNote should/will be reset to false
        // (via notes.length useEffect)
    }
    const moveNoteToCollection = async (e, id) => {
        // add to collection
        // or move to collection
        // list with checkmarks on side
        const { top, right } = {
            top: e.clientY-16,
            right: (window.innerWidth-e.clientX)+16
        }
        const handleAddToCollection = async (e, collectionName) => {
            const response = await fetch('/categorize/note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: currentNote._id, collectionName })
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success: true response from server');
            setCurrentNoteUpdate(id);
            props.refreshData();
            // immediately update button with check mark and remove check mark on old collection
            const prevCollection = miniMenuRef.current.querySelector('.hasCollection');
            if (prevCollection) prevCollection.classList.remove('hasCollection');
            const button = e.target;
            button.classList.add('hasCollection');
            //e.currentTarget.classList.add('belongsToCollection');
            setTimeout(() => console.log(currentNote.collection), 2000); // returning currentNote.collection as of when moveNoteToCollection was first called
        }
        const collectionsList = () => {
            if (!user.collections) return;
            let userCollections = [];
            for (let i = 0; i < user.collections.length; i++) {
                let collectionName = user.collections[i];
                const belongsToCollection = currentNote.collection === collectionName
                    ? ' hasCollection'
                    : '';
                userCollections.push(
                    <li key={`minimenu-user.collections-${collectionName}`}>
                        <button className={`add${belongsToCollection}`} onClick={(e) => handleAddToCollection(e, collectionName)}>
                            {collectionName}
                        </button>
                    </li>
                );
            }
            return userCollections;
        }
        const content = (
            <ul style={{ top: top+'px', right: right+'px' }} ref={miniMenuRef}>
                <li><strong>Move to collection:</strong></li>
                {collectionsList()}
            </ul>
        )
        setMiniMenu(content);
    }
    const tagNote = async (e, id) => {
        const { top, right } = {
            top: e.clientY-16,
            right: (window.innerWidth-e.clientX)+16
        }
        const handleAddTag = async (e, tagName) => {
            const response = await fetch('/tag/note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: currentNote._id, tagName })
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success: true response from server');
            const button = e.target;
            if (!button.classList.contains('hasTag')) button.classList.add('hasTag');
            else button.classList.remove('hasTag');
            props.refreshData();
            setCurrentNoteUpdate(id);
        }
        const tagsList = () => {
            if (!user.tags) return;
            let userTags = [];
            for (let i = 0; i < user.tags.length; i++) {
                let tagName = user.tags[i];
                const hasTag = (currentNote.tags.indexOf(tagName) !== -1)
                    ? ' hasTag'
                    : '';
                userTags.push(
                    <li key={`minimenu-user.tags-${tagName}`} className="tagsList">
                        <button className={`tag${hasTag}`} onClick={(e) => handleAddTag(e, tagName)}>
                            {tagName}
                        </button>
                    </li>
                )
            }
            return userTags;
        }
        const content = (
            <ul className="nolines" style={{ top: top+'px', right: right+'px' }} ref={miniMenuRef}>
                <li><strong>Tag note:</strong></li>
                {tagsList()}
            </ul>
        )
        setMiniMenu(content);
    }
    const gracefullyCloseModal = (modal) => {
        let container = modal.classList.contains('Modal')
            ? modal
            : modal.closest('.Modal');
        container.classList.add('goodbye');
        setTimeout(() => setModalObject(false), 200);
    }
    const showModal = (content) => {
        if (!content) return;
        return (
            <Modal exitModal={gracefullyCloseModal}>
                {content}
            </Modal>
        )
    }
    const showMiniMenu = (content) => {
        if (!content) return;
        return (
            <MiniMenu exitMenu={() => setMiniMenu(false)}>
                {content}
            </MiniMenu>
        )
    }
    const noNoteSelected = () => {
        if (view === 'all-notes' && !notes.length) return (
            <div>
                <h1>Hi there!</h1>
                <p>You haven't added any notes.</p>
                <button onClick={createNewNote}>Create a note</button>
            </div>
        )
        if (notes.length) return (
            <div>
                <h1>No note selected!</h1>
                Select a note from the panel on the left to get started.
            </div>
        )
        return (
            <div>
                <h1>No note selected!</h1>
                No notes found in this category.
            </div>
        )
    }
    const editOrDeleteCollection = (e, collectionName) => {
        if (view.type !== 'collection') return;
        // mini menu -> edit or delete
        const { top, right } = {
            top: e.clientY-16,
            right: (window.innerWidth-e.clientX)+16
        }
        const editCollection = () => {
            setMiniMenu(false);
            const handleEdit = async (e) => {
                e.preventDefault();
                const inputCollectionName = e.target[0].value;
                const response = await fetch('/edit/collection', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: user.username,
                        collectionName,
                        updatedName: inputCollectionName
                    })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success: true response from server');
                // refresh current user
                setCurrentNoteUpdate(notes[getIndex(currentNote._id)]);
                props.refreshData();
                gracefullyCloseModal(modalContent.current);
                // change view
                props.updateView({ type: 'collection', name: inputCollectionName });
            }
            let modalcontent = (
                <div className="modalContent" ref={modalContent}>
                    <h2>Edit collection</h2>
                    <form onSubmit={handleEdit} autoComplete="off">
                        <label htmlFor="updatedName">Edit collection name:</label>
                        <input type="text" name="updatedName" />
                        <div className="buttons">
                            <button type="submit">Save changes</button>
                            <button type="button" className="greyed">Cancel</button>
                        </div>
                    </form>
                </div>
            );
            setModalObject(modalcontent);
        }
        const deleteCollection = () => {
            setMiniMenu(false);
            const handleDelete = async () => {
                const response = await fetch('/delete/collection', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: user.username, collectionName })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success: true response from server');
                // switch to all notes
                // switch to the one above it; if none, switch to the one below it; else all-notes
                let nextInLine = () => {
                    let thisCollectionIndex = user.collections.indexOf(collectionName);
                    let nextCollection;
                    if (user.collections[thisCollectionIndex-1]) {
                        nextCollection = user.collections[thisCollectionIndex-1];
                        return { type: 'collection', name: nextCollection }
                    } else if (user.collections[thisCollectionIndex+1]) {
                        nextCollection = user.collections[thisCollectionIndex+1];
                        return { type: 'collection', name: nextCollection }
                    } else return 'all-notes';
                }
                props.updateView(nextInLine);
                props.refreshData();
                gracefullyCloseModal(modalContent.current);
            }
            let modalcontent = (
                <div className="modalContent" ref={modalContent}>
                    <h2>Are you sure?</h2>
                    Deleting this collection will not delete the notes inside it.
                    <div className="buttons">
                        <button onClick={handleDelete}>Yes, I'm sure</button>
                        <button className="greyed">Take me back</button>
                    </div>
                </div>
            );
            setModalObject(modalcontent);
        }
        const content = (
            <ul style={{ top: top+'px', right: right+'px' }} ref={miniMenuRef}>
                <li><button onClick={editCollection}>Edit collection</button></li>
                <li><button onClick={deleteCollection}>Delete collection</button></li>
            </ul>
        );
        setMiniMenu(content);
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
        return (
            <div className="endofnotes" style={{ marginTop: '1rem' }}>None found</div>
        )
    }
    const generateNotesList = () => {
        let notesList = [];
        for (let i = 0; i < notes.length; i++) {
            notesList.push(<NotePreview
                key={notes[i]._id}
                current={currentNote._id}
                temp={false}
                {...notes[i]}
            />)
        }
        return notesList;
    }
    const showingTags = () => {
        if (view.type !== 'tags') return;
        const tagList = () => {
            const removeTag = (tagName) => {
                const updatedArray = (prevView) => {
                    let currentViewTags = [...prevView.tags];
                    let index = currentViewTags.indexOf(tagName);
                    currentViewTags.splice(index, 1);
                    return currentViewTags;
                }
                props.updateView(prevView => ({
                    type: 'tags',
                    tags: updatedArray(prevView)
                }));
                return;
            }
            let viewingTags = [];
            for (let i = 0; i < view.tags.length; i++) {
                viewingTags.push(<button onClick={() => removeTag(view.tags[i])} key={`viewingTag-${view.tags[i]}`} className="tag hasTag">
                    {view.tags[i]}
                </button>)
            }
            return viewingTags;
        }
        return (
            <div className="showingTags">
                <h2>Viewing notes tagged:</h2>
                {tagList()}
            </div>
        )
    }
    return (
        <div className="Notes">
            {showMiniMenu(miniMenu)}
            {showModal(modalObject)}
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
                        />
                    :   noNoteSelected()
                }
            </div>
            {currentNote && <div className="Options">
                <button className={currentNote.starred ? 'hasStar' : null} onClick={() => starNote(currentNote._id)}><i className="fas fa-star"></i></button>
                <button onClick={(e) => moveNoteToCollection(e, currentNote._id)}><i className="fas fa-book"></i></button>
                <button onClick={(e) => tagNote(e, currentNote._id)}><i className="fas fa-tags"></i></button>
                <button><i className="fas fa-share-square"></i></button>
                <button><i className="fas fa-file-download"></i></button>
                <button onClick={() => confirmDeletion(currentNote._id)}><i className="fas fa-trash"></i></button>
            </div>}
        </div>
    )
}

function Header({ title, button }) {
    return (
        <div className="Header">
            <div className="h1"><h1>{title}</h1></div>
            <div className="button">{button}</div>
        </div>
    )
}