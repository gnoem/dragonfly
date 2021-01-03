import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import NotePreview from './NotePreview';
import NoteEditor from './NoteEditor';
import { elementHasParent } from '../utils';

export default function Notes(props) {
    const { view, user, notes } = props;
    const [currentNote, setCurrentNote] = useState(notes[0]);
    const [newestNote, setNewestNote] = useState(null);
    const [addingNewNote, setAddingNewNote] = useState(false);
    const [tempNotePreview, setTempNotePreview] = useState('New note');
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [submitEditorState, setSubmitEditorState] = useState(false);
    const [modalObject, setModalObject] = useState(false);
    const modalContent = useRef(null);
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
    const prevNoteId = usePrevious(currentNote._id);
    const currentNoteIndex = currentNote ? getIndex(currentNote._id) : 0;
    useEffect(() => {
        let firstNote = notes[0];
        if (!notes.length) firstNote = false;
        setCurrentNote(firstNote);
        setAddingNewNote(false);
        setTempNotePreview('New note');
    // do not want this firing everytime note changes
    // eslint-disable-next-line
    }, [view]);
    useEffect(() => {
        if (prevView !== view) return; // if notes.length changed because user switched view, return
        if (prevNotesCount < notes.length) { // a note has been added
            if (!newestNote) return;
            if (!currentNote) return; // to fix mid-CREATENOTE-switch-to-no-note-selected-but-save-changes bug
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
    useEffect(() => {
        // this is for when you edit a note directly and currentNote needs to update
        if (prevNoteId !== currentNote._id) return; // to fix mid-edit-switch-to-different-note-but-save-changes bug
        if (prevNotesCount !== notes.length) return; // already specified what should happen if notes.length changes
        if (prevView !== view) return; // already specified what should happen if view changes
        setCurrentNote(notes[currentNoteIndex]);
        // mid-edit-switch-to-different-note-but-save-changes bug:
        // when you are in the middle of editing a note, then switch to another note and
        // opt to save changes, and then the note submit goes through, this gets called and it sets
        // current note BACK to the note you just switched away from

    // come back and figure out what needs to be in the dependency array
    // eslint-disable-next-line
    }, [notes]);
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
                setCurrentNote(notes[getIndex(noteId)]);
                return console.log('went all the way through');
            }
            console.log('clicked in gray');
            setCurrentNote(false);
            return;
        }
        const warnSaveChanges = () => { // next: () => handleClick(e, true)
            if (!unsavedChanges) return;
            const discardChanges = (next) => {
                gracefullyCloseModal(modalContent.current);
                next();
            }
            const saveChanges = (next) => {
                gracefullyCloseModal(modalContent.current);
                console.dir(next);
                setSubmitEditorState(next); // handleSubmit will take next() as parameter if (props.submitEditorState === true)
                /* setSubmitEditorState(true); // this is happening second
                next(); // this is happening first */
            }
            // call handleClick again, with same (initial) e, but bypass "if unsavedChanges" statement
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
        if (view !== 'starred-notes') setCurrentNote(notes[getIndex(id)]); // need this to be up to date though
        // if in starred notes, then clicking star will cause the note to disappear and then currentNote should/will be reset to false
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
    const listHeader = () => {
        switch(view) {
            case 'all-notes': return 'All notes';
            case 'starred-notes': return 'Starred notes';
            default: return 'All notes';
        }
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
    return (
        <div className="Notes">
            <div id="demo" onClick={() => console.dir(submitEditorState)}></div>
            {showModal(modalObject)}
            <div className="List">
                <div className="Header">
                    <div className="h1"><h1>{listHeader()}</h1></div>
                    <div className="button">
                        {view === 'all-notes' ? <button className="newNote" onClick={createNewNote}>
                            <i className="fas fa-plus"></i>
                        </button> : null}
                    </div>
                </div>
                <div className="NotePreviews" onClick={handleClick}>
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
                <button><i className="fas fa-share-square"></i></button>
                <button><i className="fas fa-file-download"></i></button>
                <button onClick={() => confirmDeletion(currentNote._id)}><i className="fas fa-trash"></i></button>
            </div>}
        </div>
    )
}