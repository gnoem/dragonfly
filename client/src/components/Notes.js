import { useState, useEffect, useRef } from 'react';
import NoteEditor from './NoteEditor';
import List from './List';
import Modal from './Modal';
import { elementHasParent } from '../utils';

export default function Notes(props) {
    const { view, user, notes } = props;
    const [addingNewNote, updateNewNote] = useState(false); // need to close on submit in NoteEditor
    const [tempNotePreview, updateTempNotePreview] = useState({
        title: 'New note',
        content: ''
    });
    const [unsavedChanges, updateUnsavedChanges] = useState(false); // (a) cancelling new empty note (b) switching to different note after making changes
    const [currentNote, updateCurrentNote] = useState(notes[0]);
    const [newestNote, updateNewestNote] = useState(null);
    const [showingModal, updateShowingModal] = useState(false);
    const NotePreviews = useRef(null);
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
    const currentNoteIndex = currentNote ? getIndex(currentNote._id) : 0;
    useEffect(() => {
        // this is for when note data changes and currentNote needs to update
        if (prevNotesCount !== notes.length) return; // want it to go to a different useEffect for if note is added/deleted
        if (prevView !== view) return;
        updateCurrentNote(notes[currentNoteIndex]);
    // we don't need prevNotesCount in the dependency array
    // eslint-disable-next-line
    }, [notes]);
    useEffect(() => {
        if (prevNotesCount === undefined) return;
        if (prevView !== view) return;
        console.log('is working')
        if (prevNotesCount < notes.length) { // a note has been added
            updateCurrentNote(notes[getIndex(newestNote)]);
        }
        if (prevNotesCount > notes.length) { // a note has been deleted or removed via unstar, etc.
            updateCurrentNote(false); // for now
        }
    // we don't need prevNotesCount in the dependency array
    // eslint-disable-next-line
    }, [notes.length]); // if notes.length changes but view stays the same, that means something has been added or deleted *****(or unstarred, etc)*****
    useEffect(() => {
        let firstNote = notes[0];
        if (!notes.length) firstNote = false;
        updateCurrentNote(firstNote);
        updateNewNote(false);
        updateTempNotePreview({ title: 'New note', content: '' });
        updateUnsavedChanges(false);
    // we don't need prevView or notes in the dependency array
    // eslint-disable-next-line
    }, [view]);
    const updateView = (id, confirmed = false) => {
        if (!unsavedChanges || confirmed) {
            updateNewNote(false);
            updateTempNotePreview({ title: 'New note', content: '' });
            updateUnsavedChanges(false);
            updateCurrentNote(notes[getIndex(id)]);
            return;
        }
        warnSaveChanges(() => updateView(id, true));
    }
    const generateNotesList = () => {
        let notesList = [];
        for (let i = 0; i < notes.length; i++) {
            notesList.push(
                <List
                    key={notes[i]._id}
                    current={currentNote._id}
                    {...notes[i]}
                    unsavedChanges={unsavedChanges}
                    makeActive={updateView}
                />
            )
        }
        return notesList;
    }
    const createNewNote = () => {
        if (unsavedChanges) {
            return console.log('u really want to ?');
        }
        updateNewNote(true);
        updateTempNotePreview({ title: 'New note', content: '' });
        updateUnsavedChanges(false);
        updateCurrentNote({});
        NotePreviews.current.scrollTop = 0;
        // scroll to top of .NotePreviews
    }
    const cancelNewNote = (e, confirmed = false) => {
        if (!unsavedChanges || confirmed) {
            if (elementHasParent(e.target, 'NotePreview')) {
                let notePreview = e.target.classList.contains('NotePreview')
                    ? e.target
                    : e.target.closest('.NotePreview');
                let noteId = notePreview.getAttribute('data-id');
                updateNewNote(false);
                updateCurrentNote(notes[getIndex(noteId)]);
                return;
            }
            updateNewNote(false);
            updateTempNotePreview({ title: 'New note', content: '' });
            updateCurrentNote(false);
            return;
        }
        if (unsavedChanges) return warnSaveChanges(() => cancelNewNote(e, true));
        if (!addingNewNote) {
            updateUnsavedChanges(false);
            if (!elementHasParent(e.target, 'NotePreview')) return updateCurrentNote(false);
            return;
        }
    }
    const updateOnNoteSubmit = (id) => {
        // only called when creating note, not editing note
        // if note is created, that means refreshData function has been called
        // which means we are waiting on notes array to update
        // once notes array updates, then we can setCurrentNote
        updateNewNote(false);
        updateTempNotePreview({ title: 'New note', content: '' });
        updateNewestNote(id);
        /* when notes prop is updated with the new note added, useEffect up above - the one w/ [notes.length]
        as a dependency array - is triggered and there updateView() is called using id of newest note */
    }
    const gracefullyCloseModal = (modal) => {
        let container = modal.classList.contains('Modal')
            ? modal
            : modal.closest('.Modal');
        container.classList.add('goodbye');
        setTimeout(() => updateShowingModal(false), 200);
    }
    const showModal = (content) => {
        if (!content) return;
        return (
            <Modal exitModal={gracefullyCloseModal}>
                {content}
            </Modal>
        )
    }
    const modalContent = useRef(null);
    const warnSaveChanges = (next, e) => {
        const discardChanges = (next) => {
            updateTempNotePreview({ title: 'New note', content: '' });
            updateUnsavedChanges(false);
            gracefullyCloseModal(modalContent.current);
            next(e, true); // true = confirmed
        }
        const content = (
            <div className="modalContent" ref={modalContent}>
                <h2>Save changes?</h2>
                It looks like you have unsaved changes. Would you like to save changes or discard?
                <div className="buttons">
                    <button>Save changes</button> {/* currentNote */}
                    <button className="greyed" onClick={() => discardChanges(next)}>Discard changes</button>
                </div>
            </div>
        );
        updateShowingModal(content);
    }
    const confirmDeletion = (id) => {
        const content = (
            <div className="modalContent" ref={modalContent}>
                <h2>Are you sure?</h2>
                This action can't be undone.
                <div className="buttons">
                    <button onClick={() => deleteNote(id)}>Yes, I'm sure</button>
                    <button className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Cancel</button>
                </div>
            </div>
        );
        updateShowingModal(content);
    }
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
        updateCurrentNote(notes[index]);
        props.refreshData();
        updateUnsavedChanges(false);
        gracefullyCloseModal(modalContent.current);
    }
    const starNote = async (id) => {
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
    const listHeader = () => {
        switch (view) {
            case 'all-notes': return 'All notes';
            case 'starred-notes': return 'Starred notes';
            default: return 'All notes';
        }
    }
    return (
        <div className="Notes">
            <div id="demo" onClick={() => {
                console.dir(currentNote);
            }}></div>
            {showModal(showingModal)}
            <div className="List">
                <div className="Header">
                    <div className="h1"><h1>{listHeader()}</h1></div>
                    <div className="button">
                        {view === 'all-notes' ? <button className="newNote" onClick={createNewNote}>
                            <i className="fas fa-plus"></i>
                        </button> : null}
                    </div>
                </div>
                <div className="NotePreviews" onClick={cancelNewNote} ref={NotePreviews}>
                    {addingNewNote && <List {...tempNotePreview} makeActive={() => {}} />}
                    {generateNotesList()}
                    {notes.length
                        ?   <div className="endofnotes">
                                <span className="nowrap">You've reached the</span>
                                <span className="nowrap">end of your notes.</span>
                            </div>
                        :   <div className="endofnotes" style={{ marginTop: '1rem' }}>None found</div>}
                </div>
            </div>
            <div className="Editor">
                {currentNote
                    ? <NoteEditor
                        user={user}
                        currentNote={currentNote}
                        updateOnNoteSubmit={updateOnNoteSubmit}
                        unsavedChanges={unsavedChanges}
                        updateUnsavedChanges={updateUnsavedChanges}
                        updatePreview={updateTempNotePreview}
                        refreshData={props.refreshData}
                        />
                    : <div>
                        <h1>No note selected!</h1>
                        Select a note from the panel on the left to get started.
                    </div>
                }
            </div>
            {currentNote && <div className="Options">
                <button className={currentNote.starred ? 'hasStar' : null} onClick={() => {starNote(currentNote._id)}}><i className="fas fa-star"></i></button>
                <button><i className="fas fa-share-square"></i></button>
                <button><i className="fas fa-file-download"></i></button>
                <button onClick={() => confirmDeletion(currentNote._id)}><i className="fas fa-trash"></i></button>
            </div>}
        </div>
    )
}