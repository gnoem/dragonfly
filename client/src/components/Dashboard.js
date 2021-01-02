import { useState, useEffect } from 'react';
import Loading from './Loading';
import Sidebar from './Sidebar';
import Notes from './Notes';
import NoteEditor from './NoteEditor';
import MyAccount from './MyAccount';

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
        const authorize = async () => {
            const response = await fetch(`/auth/${user._id}`);
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success: true response from server');
            updateAccessToken(body.accessToken);
        }
        authorize();
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
        if (!notes.length) return (
            <div className="Panel">
                <Welcome user={user} refreshData={() => updateTrigger(Date.now())} />
            </div>
        );
        else return (
            <Notes user={user} notes={notes} refreshData={() => updateTrigger(Date.now())} />
        )
    }
    const appContent = () => {
        switch (view) {
            case 'all-notes': return allNotes();
            case 'my-account': return (
                <MyAccount updateIsLoaded={updateIsLoaded} refreshData={() => updateTrigger(Date.now())} user={user} />
            );
            default: return allNotes();
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
            <Sidebar updateView={updateView} />
            {appContent()}
        </div>
    )
}

function Welcome(props) {
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
        <NoteEditor user={props.user} refreshData={props.refreshData} />
    )
}

function Login(props) {
    const [password, updatePassword] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch('/login/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: props.user.username,
                password
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        window.location.reload();
    }
    return (
        <div className="Login">
            <form onSubmit={handleLogin} autoComplete="off">
                <h1 className="display">Dragonfly</h1>
                <div className="passwordProtected">
                    <i className="giantIcon fas fa-lock"></i>
                    <p>This user's notes are protected.</p>
                </div>
                <div>
                    <label htmlFor="password">Enter password:</label>
                    <input type="password" name="password" onChange={(e) => updatePassword(e.target.value)} />
                </div>
                <div className="formCheck">
                    <input type="checkbox" name="rememberThisDevice" /> <label htmlFor="rememberThisDevice">Remember this device</label>
                </div>
                <div className="buttons">
                    <button>Submit</button>
                </div>
            </form>
        </div>
    )
}