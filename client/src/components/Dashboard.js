import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import NoteEditor from './NoteEditor';

export default function Dashboard(props) {
    const { id } = props.match.params;
    const [user, updateUser] = useState(null);
    const [notes, updateNotes] = useState([]);
    const [isLoaded, updateIsLoaded] = useState(false);
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
    }, [id]);
    if (!isLoaded) return <Loading />
    const displayNotes = () => {
        if (!notes.length) return (
            <div className="Panel">
                <Welcome />
            </div>
        );
        else return (
            <>
                <div className="List"></div>
                <div className="View">hi {user._id}</div>
            </>
        )
    }
    return (
        <div className="Dashboard">
            <Sidebar />
            {displayNotes()}
        </div>
    )
}

function NoNotes() {
    return (
        <>
            <h1>You don't have any notes saved.</h1>
        </>
    )
}

function Welcome() {
    const [writingNote, updateWritingNote] = useState(false);
    if (!writingNote) return (
        <div className="Welcome">
            <h1>Hi there!</h1>
            <p>Welcome to Dragonfly.</p>
            <p>Your public dashboard URL is <b>{window.location.href}</b>.</p>
            <p>If you would like to customize your Dragonfly URL, password-protect your notes, and personalize your dashboard, you can do so in <a href="/">Account Settings</a>.</p>
            <button onClick={() => updateWritingNote(true)}>Create your first note</button>
        </div>
    )
    return (
        <NoteEditor />
    )
}

function Loading() {
    return (
        <div className="Loading">
            Loading...
        </div>
    )
}