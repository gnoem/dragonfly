import { useState, useEffect } from 'react';
import Loading from './Loading';
import Menu from './Menu';
import Sidebar from './Sidebar';
import Notes from './Notes';
import MyAccount from './MyAccount';
import Login from './Login';

export default function Dashboard(props) {
    const { id } = props.match.params;
    const isMobile = window.innerWidth < 900;
    const [accessToken, setAccessToken] = useState(false);
    const [user, setUser] = useState(null);
    const [notes, setNotes] = useState([]);
    const [view, setView] = useState('all-notes');
    const [isLoaded, setIsLoaded] = useState(false);
    const [triggerGetData, setTrigger] = useState(null);
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
                <Notes
                    view={view}
                    updateView={setView}
                    user={user}
                    notes={getNotes(view)}
                    isMobile={isMobile}
                    refreshData={() => setTrigger(Date.now())} />
            );
        }
        if (view === 'my-account') return (
            <MyAccount
                user={user}
                updateIsLoaded={setIsLoaded}
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
                    <Notes
                        view={view}
                        updateView={setView}
                        user={user}
                        notes={notesInCollection(view.name)}
                        isMobile={isMobile}
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
                    <Notes
                        view={view}
                        updateView={setView}
                        user={user}
                        notes={notesWithTheseTags(view.tags)}
                        isMobile={isMobile}
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
            {isMobile
                ? <Menu user={user} view={view} updateView={setView} refreshData={() => setTrigger(Date.now())} />
                : <Sidebar user={user} view={view} updateView={setView} refreshData={() => setTrigger(Date.now())} />}
            {appContent()}
        </div>
    );
}