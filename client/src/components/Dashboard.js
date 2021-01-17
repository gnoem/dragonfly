import { useState, useEffect } from 'react';
import Loading from './Loading';
import Sidebar from './Sidebar';
import Notes from './Notes';
import MyAccount from './MyAccount';
import Login from './Login';

export default function Dashboard(props) {
    const { id } = props.match.params;
    const [accessToken, updateAccessToken] = useState(false);
    const [user, updateUser] = useState(null);
    const [notes, updateNotes] = useState([]);
    const [view, updateView] = useState('all-notes');
    const [isLoaded, updateIsLoaded] = useState(false);
    const [triggerGetData, updateTrigger] = useState(null);
    useEffect(() => {
        if (!user) return;
        if (accessToken) return;
        const authorize = async () => {
            const response = await fetch(`/auth/${user._id}`);
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success: true response from server');
            updateAccessToken(body.accessToken);
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
            updateUser(body.user);
            updateNotes(body.notes);
            updateIsLoaded(true);
        }
        getData();
    }, [id, triggerGetData]);
    if (!isLoaded) return <Loading />
    const allNotes = () => {
        let filteredNotes = notes.filter(note => !note.trash);
        return (
            <Notes view={view} user={user} notes={filteredNotes} refreshData={() => updateTrigger(Date.now())} />
        )
    }
    const starredNotes = () => {
        let starredNotes = notes.filter(note => note.starred);
        return (
            <Notes view={view} user={user} notes={starredNotes} refreshData={() => updateTrigger(Date.now())} />
        )
    }
    const collection = (collectionName) => {
        let notesInCollection = notes.filter(note => note.collection === collectionName);
        return (
            <Notes view={view} updateView={updateView} user={user} notes={notesInCollection} refreshData={() => updateTrigger(Date.now())} />
        )
    }
    const tags = (tags) => {
        if (view.type !== 'tags') return;
        if (!tags.length) return (
            <Notes view={view} updateView={updateView} user={user} notes={[]} refreshData={() => updateTrigger(Date.now())} />
        );
        const notesWithTheseTags = (tags) => { // returns an array of notes
            let taggedNotes = [];
            for (let i = 0; i < notes.length; i++) {
                let testObject = {};
                // look in notes[i].tags
                notes[i].tags.forEach((note, index) => {
                    testObject[note] = index;
                    /* testObject = {
                        'reference',        testObject[0]
                        'witchy',           testObject[1]
                        'recipe'            testObject[2]
                    } */
                });
                // see if tags 'recipe' and 'witchy' are in it
                let thisNoteHasTheseTags = (view.sortTags === 'all')
                    ? tags.every(tag => testObject[tag] !== undefined) // e.g. if testObject['recipe'] is defined (which it is, at index 2)
                    : tags.some(tag => testObject[tag] !== undefined);
                if (thisNoteHasTheseTags) taggedNotes.push(notes[i]);
            }
            return taggedNotes;
        }
        let taggedNotes = notesWithTheseTags(tags);
        return (
            <Notes view={view} updateView={updateView} user={user} notes={taggedNotes} refreshData={() => updateTrigger(Date.now())} />
        )
    }
    const trashedNotes = () => {
        let trashedNotes = notes.filter(note => note.trash);
        return (
            <Notes view={view} user={user} notes={trashedNotes} refreshData={() => updateTrigger(Date.now())} />
        )
    }
    const appContent = () => {
        switch (view) {
            case 'all-notes': return allNotes();
            case 'starred-notes': return starredNotes();
            case 'trash': return trashedNotes();
            case 'my-account': return (
                <MyAccount updateIsLoaded={updateIsLoaded} refreshData={() => updateTrigger(Date.now())} user={user} />
            );
            default: {
                if (view.type === 'collection') {
                    return collection(view.name);
                }
                if (view.type === 'tags') {
                    return tags(view.tags);
                }
                return allNotes();
            }
        }
    }
    const passwordProtected = user.username;
    if (passwordProtected && !accessToken) {
        return (
            <Login user={user} />
        )
    }
    return (
        <div className="Dashboard">
            <Sidebar user={user} view={view} updateView={updateView} refreshData={() => updateTrigger(Date.now())} />
            {appContent()}
        </div>
    )
}