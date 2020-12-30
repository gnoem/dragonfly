import { useState, useRef } from 'react';
import NoteEditor from './NoteEditor';
import List from './List';

export default function Notes(props) {
    const { user, notes } = props;
    const [temporaryNotePreview, updateTemporaryNotePreview] = useState(false);
    const [currentNote, updateCurrentNote] = useState(notes[0]);
    const allNotes = useRef(null);
    const updateView = (id) => {
        const getIndex = (id) => {
            return notes.findIndex(note => id === note._id);
        }
        updateCurrentNote(notes[getIndex(id)]);
    }
    const generateNotesList = () => {
        let notesList = [];
        for (let i = 0; i < notes.length; i++) {
            notesList.push(
                <List key={notes[i]._id} current={currentNote._id} {...notes[i]} makeActive={updateView} />
            )
        }
        return notesList;
    }
    const revertFocus = (e) => {
        return;
        function elementHasParent(element, classname) {
            if (element.className && element.className.split(' ').indexOf(classname) >= 0) return true;
            return element.parentNode && elementHasParent(element.parentNode, classname);
        }
        if (!elementHasParent(e.target, 'NotePreview')) return updateCurrentNote(false);
    }
    const createNewNote = () => {
        if (!temporaryNotePreview) {
            updateTemporaryNotePreview(true);
            updateCurrentNote(false);
        }
        else {
            updateTemporaryNotePreview(false);
            updateCurrentNote(notes[0]);
        }
    }
    const cancelNewNote = () => {
        if (!temporaryNotePreview) return;
        updateTemporaryNotePreview(false);
        updateCurrentNote(notes[0]);
    }
    const temporaryNote = {
        title: 'New note'
    }
    return (
        <div className="Notes">
            <div className="List" onClick={cancelNewNote}>
                <div className="Header">
                    <div className="h1"><h1>All Notes</h1></div>
                    <div className="button">
                        <button className="newNote" onClick={createNewNote}>
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div className="AllNotes" onClick={revertFocus} ref={allNotes}>
                    {temporaryNotePreview && <List {...temporaryNote} makeActive={() => {}} />}
                    {generateNotesList()}
                </div>
            </div>
            <div className="Editor">
                <NoteEditor user={user} currentNote={currentNote} refreshData={props.refreshData} />
            </div>
            <div className="Options">
                <button><i className="fas fa-share-square"></i></button>
                <button><i className="fas fa-file-download"></i></button>
                <button><i className="fas fa-trash"></i></button>
            </div>
        </div>
    )
}