import { useState, useEffect, useRef } from 'react';
import Loading from './Loading';
import Menu from './Menu';
import Sidebar from './Sidebar';
import Main from './Main';
import MyAccount from './MyAccount';
import Login from './Login';
import Modal from './Modal';

export default function Dashboard(props) {
    const { id } = props.match.params;
    const isMobile = window.innerWidth < 900;
    const [accessToken, setAccessToken] = useState(false);
    const [currentNote, setCurrentNote] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [shouldSubmit, setShouldSubmit] = useState(null);
    const [user, setUser] = useState(null);
    const [notes, setNotes] = useState([]);
    const [view, setView] = useState('all-notes');
    const [isLoaded, setIsLoaded] = useState(false);
    const [modalObject, setModalObject] = useState(false);
    const [triggerGetData, setTrigger] = useState(null);
    const modalContent = useRef(null);
    useEffect(() => {
        if (!user) return;
        if (accessToken) return;
        const authorize = async () => {
            const response = await fetch(`/auth/${user._id}`);
            const body = await response.json();
            if (!body || !body.success) return;
            setAccessToken(body.accessToken);
        }
        authorize();
    // reauthorizes fires every time getData is called
    // eslint-disable-next-line
    }, [user]);
    useEffect(() => {
        const getData = async () => {
            const response = await fetch('/get/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success: true response from server');
            setUser(body.user);
            setNotes(body.notes);
            setIsLoaded(true);
        }
        getData();
    }, [id, triggerGetData]);
    useEffect(() => {
        if (shouldSubmit === false) {
            setCurrentNote(false); // and unsavedChanges gets reset to false in handleSubmit()
            gracefullyCloseModal();
        }
    }, [shouldSubmit]);
    const gracefullyCloseModal = (modal = document.querySelector('.modalContent')) => {
        if (!modal) return;
        let container = modal.classList.contains('Modal')
            ? modal
            : modal.closest('.Modal');
        container.classList.add('goodbye');
        setTimeout(() => setModalObject(false), 200);
    }
    const warnUnsavedChanges = (targetView = view) => {
        const closeEditor = () => {
            setView(targetView);
            setCurrentNote(false);
            setUnsavedChanges(false);
            gracefullyCloseModal(modalContent.current);
        }
        const saveChanges = () => {
            setView(targetView);
            setShouldSubmit(true); // once this gets reset to false down in editor component, above useEffect takes care of the rest
            setModalObject(content({ loadingIcon: true }));
        }
        let content = (options = {
            loadingIcon: false
        }) => (
            <div className="modalContent" ref={modalContent}>
                <h2>Save changes?</h2>
                It looks like you have unsaved changes. Would you like to save changes or discard?
                {options.loadingIcon
                    ?   <Loading />
                    :   <div className="buttons">
                            <button onClick={saveChanges}>Save changes</button>
                            <button className="greyed" onClick={closeEditor}>Discard changes</button>
                        </div>
                    }
            </div>
        );
        setModalObject(content());
    }
    const updateView = (view) => {
        if (unsavedChanges) return warnUnsavedChanges(view);
        setCurrentNote(false);
        setView(view);
    }
    if (!isLoaded) return <Loading />;
    const appContent = () => {
        const allNotes = () => {
            let allNotes = notes.filter(note => !note.trash);
            return allNotes;
        }
        if (['all-notes', 'starred-notes', 'trash'].includes(view)) {
            const getNotes = (view) => {
                switch (view) {
                    case 'all-notes': return allNotes();
                    case 'starred-notes': {
                        let starredNotes = notes.filter(note => note.starred);
                        return starredNotes;
                    }
                    case 'trash': {
                        let trashedNotes = notes.filter(note => note.trash);
                        return trashedNotes;
                    }
                    default: return allNotes();
                }
            }
            return (
                <Main
                    view={view}
                    updateView={updateView}
                    user={user}
                    notes={getNotes(view)}
                    currentNote={currentNote}
                    updateCurrentNote={setCurrentNote}
                    unsavedChanges={unsavedChanges}
                    updateUnsavedChanges={setUnsavedChanges}
                    warnUnsavedChanges={warnUnsavedChanges}
                    shouldSubmit={shouldSubmit}
                    updateShouldSubmit={setShouldSubmit}
                    isMobile={isMobile}
                    updateModalObject={setModalObject}
                    gracefullyCloseModal={gracefullyCloseModal}
                    refreshData={() => setTrigger(Date.now())} />
            );
        }
        if (view === 'my-account') return (
            <MyAccount
                user={user}
                updateIsLoaded={setIsLoaded}
                updateModalObject={setModalObject}
                gracefullyCloseModal={gracefullyCloseModal}
                refreshData={() => setTrigger(Date.now())} />
        );
        if (!view.type) return allNotes();
        switch (view.type) {
            case 'collection': {
                const notesInCollection = (collectionName) => {
                    let notesInCollection = notes.filter(note => note.collection === collectionName);
                    return notesInCollection;
                }
                return (
                    <Main
                        view={view}
                        updateView={updateView}
                        user={user}
                        notes={notesInCollection(view.name)}
                        currentNote={currentNote}
                        updateCurrentNote={setCurrentNote}
                        unsavedChanges={unsavedChanges}
                        updateUnsavedChanges={setUnsavedChanges}
                        warnUnsavedChanges={warnUnsavedChanges}
                        shouldSubmit={shouldSubmit}
                        updateShouldSubmit={setShouldSubmit}
                        isMobile={isMobile}
                        updateModalObject={setModalObject}
                        gracefullyCloseModal={gracefullyCloseModal}
                        refreshData={() => setTrigger(Date.now())} />
                );
            }
            case 'tags': {
                const notesWithTheseTags = (tags) => {
                    if (!tags.length) return [];
                    const notesArray = (tags) => {
                        let taggedNotes = [];
                        for (let i = 0; i < notes.length; i++) {
                            let testObject = {};
                            notes[i].tags.forEach((tag, index) => {
                                testObject[tag] = index;
                                /* generates an object by which to compare/crosscheck the tags array passed to notesWithTheseTags as a parameter
                                and see if the note currently being iterated - notes[i] - has all/some of the tags contained in that array;
                                for example: the following object corresponds to a note containing the tags "diy", "recipe", "breakfast"
                                    testObject = {
                                        diy: 0,
                                        recipe: 1,
                                        breakfast: 2
                                    }
                                */
                            });
                            let thisNoteHasTheseTags = (view.sortTags === 'all')
                                ? tags.every(tag => testObject[tag] !== undefined)
                                : tags.some(tag => testObject[tag] !== undefined);
                            /* let's say the user searches for notes tagged with "diy", "recipe", "dinner"
                                tags.every(tag => testObject[tag] !== undefined) says to return true if
                                    testObject[diy], testObject[recipe], and testObject[dinner] are ALL defined;
                                tags.some(tag => testObject[tag] !== undefined) says to return true if
                                    testObject[diy], testObject[recipe], OR testObject[dinner] is defined
                            */
                            if (thisNoteHasTheseTags) taggedNotes.push(notes[i]);
                        }
                        return taggedNotes;
                    }
                    return notesArray(tags);
                }
                return (
                    <Main
                        view={view}
                        updateView={updateView}
                        user={user}
                        notes={notesWithTheseTags(view.tags)}
                        currentNote={currentNote}
                        updateCurrentNote={setCurrentNote}
                        unsavedChanges={unsavedChanges}
                        updateUnsavedChanges={setUnsavedChanges}
                        warnUnsavedChanges={warnUnsavedChanges}
                        shouldSubmit={shouldSubmit}
                        updateShouldSubmit={setShouldSubmit}
                        isMobile={isMobile}
                        updateModalObject={setModalObject}
                        gracefullyCloseModal={gracefullyCloseModal}
                        refreshData={() => setTrigger(Date.now())} />
                );
            }
            default: return allNotes();
        }
    }
    if (user.username /* (is password protected) */ && !accessToken) {
        return (
            <Login user={user} />
        );
    }
    return (
        <div className="Dashboard" data-mobile={isMobile}>
            <Modal exitModal={gracefullyCloseModal} content={modalObject} />
            {isMobile
                ? (!currentNote && <Menu
                    user={user}
                    view={view}
                    updateView={updateView}
                    updateModalObject={setModalObject}
                    gracefullyCloseModal={gracefullyCloseModal}
                    refreshData={() => setTrigger(Date.now())} />)
                : <Sidebar
                    user={user}
                    view={view}
                    updateView={updateView}
                    updateModalObject={setModalObject}
                    gracefullyCloseModal={gracefullyCloseModal}
                    refreshData={() => setTrigger(Date.now())} />}
            {appContent()}
        </div>
    );
}